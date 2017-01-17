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


    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
        
        /*
        Create the TVApplicationControllerContext for this application
        and set the properties that will be passed to the `App.onLaunch` function
        in JavaScript.
        */
        let appControllerContext = TVApplicationControllerContext()
        
         let path = Bundle.main.path(forResource: "Private", ofType: "plist")
        if (path == nil) {
            NSLog("Must have Private.plist with 'JSPREFIX', 'SIMULATORJSPREFIX' and 'APIURL' defined");
            exit(-1);
        }
        let myDict = NSDictionary(contentsOfFile: path!);
        var baseURL:String
            //var baseURL:String = myDict?.valueForKey("JSPREFIX") as! String
#if (arch(i386) || arch(x86_64))
        baseURL = myDict?.value(forKey: "SIMULATORJSPREFIX") as! String
#else
        baseURL = myDict?.value(forKey: "JSPREFIX") as! String
#endif
    
        let bootURL = baseURL + "js/ia.js"
        
        /*
        The JavaScript URL is used to create the JavaScript context for your
        TVMLKit application. Although it is possible to separate your JavaScript
        into separate files, to help reduce the launch time of your application
        we recommend creating minified and compressed version of this resource.
        This will allow for the resource to be retrieved and UI presented to
        the user quickly.
        */
        if let javaScriptURL = URL(string: bootURL) {
            appControllerContext.javaScriptApplicationURL = javaScriptURL
        }
        
        appControllerContext.launchOptions["BASEURL"] = baseURL
        
        appControllerContext.launchOptions["APIURL"] = myDict?.value(forKey: "APIURL") as! String
        
        
//        for (kind, value) in launchOptions! {
//            appControllerContext.launchOptions[(kind as? String)!] = value
//        }
        
        appController = TVApplicationController(context: appControllerContext, window: window, delegate: self)

        return true
    }
    
    // MARK: TVApplicationControllerDelegate
    
    func appController(_ appController: TVApplicationController, didFinishLaunching options: [String: Any]?) {
        print("\(#function) invoked with options: \(options)")
    }
    
    func appController(_ appController: TVApplicationController, didFail error: Error) {
        print("\(#function) invoked with error: \(error)")
        
        let title = "Error Launching Application"
        let message = error.localizedDescription
        let alertController = UIAlertController(title: title, message: message, preferredStyle:.alert )
        // we want to send the message back to matinee
        self.appController?.navigationController.present(alertController, animated: true, completion: { () ->     Void in
            // ...
        })
        
    }
    
    func appController(_ appController: TVApplicationController, didStop options: [String: Any]?) {
        print("\(#function) invoked with options: \(options)")
    }
    

}

