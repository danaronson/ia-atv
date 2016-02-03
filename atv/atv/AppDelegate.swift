//
//  AppDelegate.swift
//  atv
//
//  Created by Dan Aronson on 1/16/16.
//  Copyright © 2016 Dan Aronson. All rights reserved.
//

import UIKit
import TVMLKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, TVApplicationControllerDelegate {

    var window: UIWindow?
    var appController: TVApplicationController?


    func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
        
        /*
        Create the TVApplicationControllerContext for this application
        and set the properties that will be passed to the `App.onLaunch` function
        in JavaScript.
        */
        let appControllerContext = TVApplicationControllerContext()
        
        let d:UIDevice = UIDevice.currentDevice()
        let simulate = d.name.rangeOfString("Simulator") != nil

        let path = NSBundle.mainBundle().pathForResource("Private", ofType: "plist")
        if (path == nil) {
            NSLog("Must have Private.plist with 'JSPREFIX', 'SIMULATORJSPREFIX' and 'APIURL' defined");
            exit(-1);
        }
        let myDict = NSDictionary(contentsOfFile: path!);
        var baseURL:String
            //var baseURL:String = myDict?.valueForKey("JSPREFIX") as! String
        if (simulate) {
            baseURL = myDict?.valueForKey("SIMULATORJSPREFIX") as! String
        } else {
            baseURL = myDict?.valueForKey("JSPREFIX") as! String
        }
    
        let bootURL = baseURL + "js/ia.js"
        
        /*
        The JavaScript URL is used to create the JavaScript context for your
        TVMLKit application. Although it is possible to separate your JavaScript
        into separate files, to help reduce the launch time of your application
        we recommend creating minified and compressed version of this resource.
        This will allow for the resource to be retrieved and UI presented to
        the user quickly.
        */
        if let javaScriptURL = NSURL(string: bootURL) {
            appControllerContext.javaScriptApplicationURL = javaScriptURL
        }
        
        appControllerContext.launchOptions["BASEURL"] = baseURL
        
        appControllerContext.launchOptions["APIURL"] = myDict?.valueForKey("APIURL") as! String
        
        
        if let launchOptions = launchOptions as? [String: AnyObject] {
            for (kind, value) in launchOptions {
                appControllerContext.launchOptions[kind] = value
            }
        }
        
        appController = TVApplicationController(context: appControllerContext, window: window, delegate: self)

        return true
    }
    
    // MARK: TVApplicationControllerDelegate
    
    func appController(appController: TVApplicationController, didFinishLaunchingWithOptions options: [String: AnyObject]?) {
        print("\(__FUNCTION__) invoked with options: \(options)")
    }
    
    func appController(appController: TVApplicationController, didFailWithError error: NSError) {
        print("\(__FUNCTION__) invoked with error: \(error)")
        
        let title = "Error Launching Application"
        let message = error.localizedDescription
        let alertController = UIAlertController(title: title, message: message, preferredStyle:.Alert )
        // we want to send the message back to matinee
        self.appController?.navigationController.presentViewController(alertController, animated: true, completion: { () ->     Void in
            // ...
        })
        
    }
    
    func appController(appController: TVApplicationController, didStopWithOptions options: [String: AnyObject]?) {
        print("\(__FUNCTION__) invoked with options: \(options)")
    }
    

}

