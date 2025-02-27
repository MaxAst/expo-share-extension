//
//  ShareViewController.h
//  basicShareExtension
//
//  Created by Maximilian Ast on 01.02.25.
//

#import <UIKit/UIKit.h>
#import <React_RCTAppDelegate/React-RCTAppDelegate-umbrella.h>

NS_ASSUME_NONNULL_BEGIN

@interface ShareViewController : UIViewController

@property (nonatomic, strong) RCTRootViewFactory *rootViewFactory;
@property (nonatomic, weak) UIView *rootView;
@property (nonatomic, strong) UIActivityIndicatorView *loadingIndicator;

- (void)close;

@end

NS_ASSUME_NONNULL_END
