//
//  ShareViewController.mm
//  basicShareExtension
//
//  Created by Maximilian Ast on 01.02.25.
//

#import "ShareViewController.h"
#import "RCTShareView.h"
#import <React/RCTRootView.h>
#import <React/RCTSurfaceHostingProxyRootView.h>
#import <AVFoundation/AVFoundation.h>
#import <MobileCoreServices/MobileCoreServices.h>

#if __has_include(<Firebase.h>)
#import <FirebaseCore/FirebaseCore.h>
#endif

#if __has_include(<FirebaseAuth/FirebaseAuth.h>)
#import <FirebaseAuth/FirebaseAuth.h>
#endif

@implementation ShareViewController

- (void)dealloc {
    NSLog(@"🧹 ShareExtensionViewController dealloc");
    [self cleanupAfterClose];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    if (self.isBeingDismissed) {
        [self cleanupAfterClose];
    }
}

- (void)viewDidLoad {
    [super viewDidLoad];
    [self setupLoadingIndicator];
    
#if __has_include(<Firebase.h>)
    if ([[NSBundle mainBundle] objectForInfoDictionaryKey:@"WithFirebase"]) {
        [FIRApp configure];
    }
#endif
    
    [self initializeRootViewFactory];
    [self loadReactNativeContent];
    [self setupNotificationCenterObserver];
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    [self cleanupAfterClose];
}

- (void)close {
    [self.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
    [self cleanupAfterClose];
}

- (void)setupLoadingIndicator {
    self.loadingIndicator = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleLarge];
    [self.view addSubview:self.loadingIndicator];
    self.loadingIndicator.translatesAutoresizingMaskIntoConstraints = NO;
    
    [NSLayoutConstraint activateConstraints:@[
        [self.loadingIndicator.centerXAnchor constraintEqualToAnchor:self.view.centerXAnchor],
        [self.loadingIndicator.centerYAnchor constraintEqualToAnchor:self.view.centerYAnchor]
    ]];
    
    [self.loadingIndicator startAnimating];
}

- (void)initializeRootViewFactory {
    if (!self.rootViewFactory) {
        self.rootViewFactory = [RCTShareView createRootViewFactory];
    }
}

- (void)openHostAppWithPath:(NSString *)path {
    NSString *scheme = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"HostAppScheme"];
    if (!scheme) return;
    
    NSURLComponents *urlComponents = [[NSURLComponents alloc] init];
    urlComponents.scheme = scheme;
    urlComponents.host = @"";
    
    if (path) {
        NSArray *pathComponents = [path componentsSeparatedByString:@"?"];
        NSString *pathWithoutQuery = pathComponents[0];
        NSString *queryString = pathComponents.count > 1 ? pathComponents[1] : nil;
        
        if (queryString) {
            NSArray *queryParams = [queryString componentsSeparatedByString:@"&"];
            NSMutableArray *queryItems = [NSMutableArray array];
            
            for (NSString *param in queryParams) {
                NSArray *paramComponents = [param componentsSeparatedByString:@"="];
                NSString *name = paramComponents[0];
                NSString *value = paramComponents.count > 1 ? paramComponents[1] : nil;
                [queryItems addObject:[[NSURLQueryItem alloc] initWithName:name value:value]];
            }
            
            urlComponents.queryItems = queryItems;
        }
        
        NSString *pathWithSlashEnsured = [pathWithoutQuery hasPrefix:@"/"] ? pathWithoutQuery : [@"/" stringByAppendingString:pathWithoutQuery];
        urlComponents.path = pathWithSlashEnsured;
    }
    
    NSURL *url = urlComponents.URL;
    if (!url) return;
    
    [self openURL:url];
    [self close];
}

- (BOOL)openURL:(NSURL *)url {
    UIResponder *responder = self;
    while (responder) {
        if ([responder isKindOfClass:[UIApplication class]]) {
            UIApplication *application = (UIApplication *)responder;
            if (@available(iOS 18.0, *)) {
                [application openURL:url options:@{} completionHandler:nil];
                return YES;
            } else {
                return [application performSelector:@selector(openURL:options:completionHandler:) withObject:url withObject:@{}] != nil;
            }
        }
        responder = responder.nextResponder;
    }
    return NO;
}

- (void)loadReactNativeContent {
    ShareViewController * __weak weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        ShareViewController *strongSelf = weakSelf;
        if (!strongSelf) {
            NSLog(@"❌ Self was deallocated");
            return;
        }
        
        if (!strongSelf.rootView) {
            if (!strongSelf.rootViewFactory) {
                NSLog(@"🚨 Factory is nil");
                return;
            }
          
            NSLog(@"📱 Creating root view for share extension");
            
            UIView *rootView = [strongSelf.rootViewFactory viewWithModuleName:@"shareExtension" initialProperties:@{
              // Add any initial props you want to pass to your JS
              @"debugMode": @YES
            }];
          
            if (!rootView) {
              NSLog(@"❌ Failed to create root view");
              return;
            }
          
            NSLog(@"✅ Root view created successfully");
          
            NSDictionary *backgroundFromInfoPlist = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"ShareExtensionBackgroundColor"];
            NSNumber *heightFromInfoPlist = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"ShareExtensionHeight"];
            
            [strongSelf configureRootView:rootView withBackgroundColorDict:backgroundFromInfoPlist withHeight:heightFromInfoPlist.doubleValue];
            strongSelf.rootView = rootView;
        } else {
            if ([strongSelf.rootView isKindOfClass:[RCTRootView class]]) {
                ((RCTRootView *)strongSelf.rootView).appProperties = @{};
            } else if ([strongSelf.rootView isKindOfClass:[RCTSurfaceHostingProxyRootView class]]) {
                ((RCTSurfaceHostingProxyRootView *)strongSelf.rootView).appProperties = @{};
            }
        }
        
        [strongSelf.loadingIndicator stopAnimating];
        [strongSelf.loadingIndicator removeFromSuperview];
    });
}

- (void)setupNotificationCenterObserver {
    [[NSNotificationCenter defaultCenter] addObserverForName:@"close" object:nil queue:nil usingBlock:^(NSNotification * _Nonnull note) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self close];
        });
    }];
    
    [[NSNotificationCenter defaultCenter] addObserverForName:@"openHostApp" object:nil queue:nil usingBlock:^(NSNotification * _Nonnull note) {
        dispatch_async(dispatch_get_main_queue(), ^{
            NSDictionary *userInfo = note.userInfo;
            if (userInfo) {
                NSString *path = userInfo[@"path"];
                if (path) {
                    [self openHostAppWithPath:path];
                }
            }
        });
    }];
}

- (void)cleanupAfterClose {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    
    if ([self.rootView isKindOfClass:[RCTRootView class]]) {
        ((RCTRootView *)self.rootView).appProperties = nil;
    } else if ([self.rootView isKindOfClass:[RCTSurfaceHostingProxyRootView class]]) {
        ((RCTSurfaceHostingProxyRootView *)self.rootView).appProperties = @{};
    }
    
    [self.rootView removeFromSuperview];
    self.rootView = nil;
}

- (void)configureRootView:(UIView *)rootView withBackgroundColorDict:(NSDictionary *)dict withHeight:(CGFloat)height {
    rootView.backgroundColor = [self backgroundColorFromDict:dict];
    
    UIScreen *screen = [UIScreen mainScreen];
    CGRect screenBounds = screen.bounds;
    CGFloat screenScale = screen.scale;
    
    CGRect frame;
    if (height > 0) {
        frame = CGRectMake(0, screenBounds.size.height - height, screenBounds.size.width, height);
    } else {
        frame = screenBounds;
    }
    
    if ([rootView isKindOfClass:[RCTSurfaceHostingProxyRootView class]]) {
        RCTSurfaceHostingProxyRootView *proxyRootView = (RCTSurfaceHostingProxyRootView *)rootView;
        CGSize surfaceSize = CGSizeMake(frame.size.width * screenScale, frame.size.height * screenScale);
        [proxyRootView.surface setMinimumSize:surfaceSize maximumSize:surfaceSize];
        
        proxyRootView.bounds = CGRectMake(0, 0, frame.size.width, frame.size.height);
        proxyRootView.center = CGPointMake(CGRectGetMidX(frame), CGRectGetMidY(frame));
    } else {
        rootView.frame = frame;
    }
    
    rootView.translatesAutoresizingMaskIntoConstraints = NO;
    [self.view addSubview:rootView];
    
    [NSLayoutConstraint activateConstraints:@[
        [rootView.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],
        [rootView.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],
        [rootView.heightAnchor constraintEqualToConstant:frame.size.height]
    ]];
    
    if (height > 0) {
        [NSLayoutConstraint activateConstraints:@[
            [rootView.bottomAnchor constraintEqualToAnchor:self.view.bottomAnchor]
        ]];
    } else {
        [NSLayoutConstraint activateConstraints:@[
            [rootView.topAnchor constraintEqualToAnchor:self.view.topAnchor]
        ]];
    }
    
    if (height == 0) {
        rootView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    }
}

- (UIColor *)backgroundColorFromDict:(NSDictionary *)dict {
    if (!dict) return [UIColor whiteColor];
    
    CGFloat red = [dict[@"red"] doubleValue] ?: 255.0;
    CGFloat green = [dict[@"green"] doubleValue] ?: 255.0;
    CGFloat blue = [dict[@"blue"] doubleValue] ?: 255.0;
    CGFloat alpha = [dict[@"alpha"] doubleValue] ?: 1.0;
    
    return [UIColor colorWithRed:red/255.0 green:green/255.0 blue:blue/255.0 alpha:alpha];
}

@end
