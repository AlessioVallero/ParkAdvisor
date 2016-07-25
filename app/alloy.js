// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

// Require the securely module
var securely = require( 'bencoding.securely' ) ;
var properties = securely.createProperties(
{
    secret: "WantToProtectOurSensibleData20140622" ,
    encryptFieldNames: true
} ) ;

Alloy.Globals.SessionId = properties.getString( 'session_id' ) ;
Alloy.Globals.SessionUsername = Ti.App.Properties.getString( 'session_username' ) ;
Alloy.Globals.RememberMeUsername = Ti.App.Properties.getString( 'remember_me_username' ) ;
Alloy.Globals.RememberMeUsername = Ti.App.Properties.getString( 'remember_me_username' ) ;
Alloy.Globals.RememberMePassword = properties.getString( 'remember_me_password' ) ;

Alloy.Globals.MyCarLatitude = properties.getString( 'my_car_latitude' ) ;
Alloy.Globals.MyCarLongitude = properties.getString( 'my_car_longitude' ) ;

Alloy.Globals.UrbioticaAuthToken = properties.getString( 'urbiotica_auth_token' ) ;

// If a language was set, this property have a value. So we must keep it.
// Otherwise we can use the device language
var currentLanguageOnDB = Ti.App.Properties.getString( 'current_language' ) ;
if( currentLanguageOnDB )
{
    Alloy.Globals.CurrentLanguageSelectedIndex = currentLanguageOnDB ;
    if( OS_IOS )
    {
        var locale = require( "com.obscure.localehelper" ) ;

        switch( currentLanguageOnDB )
        {
            // English
            case "0":
            {
                locale.locale = "en" ;
            }
            break ;

            // Italian
            case "1":
            {
                locale.locale = "it" ;
            }
            break ;

            // Spanish
            case "2":
            {
                locale.locale = "es" ;
            }
            break ;

            // Default is english
            default:
            {
                locale.locale = "en" ;
            }
            break ;
        }
    }
    else
    {
        var locale = require( "com.shareourideas.locale" ) ;

        switch( currentLanguageOnDB )
        {
            // English
            case "0":
            {
                locale.setLocale( "en" ) ;
            }
            break ;

            // Italian
            case "1":
            {
                locale.setLocale( "it" ) ;
            }
            break ;

            // Spanish
            case "2":
            {
                locale.setLocale( "es" ) ;
            }
            break ;

            // Default is english
            default:
            {
                locale.setLocale( "en" ) ;
            }
            break ;
        }
    }
}
else
{
    if( Ti.Locale.currentLanguage == "es" )
    {
        Alloy.Globals.CurrentLanguageSelectedIndex = "2" ;
    }
    else if( Ti.Locale.currentLanguage == "it" )
    {
        Alloy.Globals.CurrentLanguageSelectedIndex = "1" ;
    }
    else
    {
        Alloy.Globals.CurrentLanguageSelectedIndex = "0" ;
    }
}

///////////////////////////////////// TIMEOUT ////////////////////////////////////
Alloy.Globals.LoginRegistrationTimeoutMillisecs = 20000 ;           // 20 seconds
Alloy.Globals.SessioneControlloTimeoutMillisecs = 30000 ;           // 30 seconds
Alloy.Globals.LogoutTimeoutMillisecs = 15000 ;                      // 15 seconds
Alloy.Globals.QueryParkWhizTimeoutMillisecs = 15000 ;               // 15 seconds
Alloy.Globals.QueryUrbioticaTimeoutMillisecs = 11500 ;              // 11.5 seconds
Alloy.Globals.GeolocationRequestTimeoutMillisecs = 15000 ;          // 15 seconds
Alloy.Globals.OpenToastNotificationDefaultTimeoutMillisecs = 3000 ; // 3 seconds
Alloy.Globals.CloseToastNotificationTimeoutMillisecs = 1000 ;       // 1 second
//////////////////////////////////////////////////////////////////////////////////

Alloy.Globals.CreateAndOpenControllerDebounceWaitPeriodMillisecs = 500 ; // Half of a second
Alloy.Globals.CleanParkWhizCacheLoopPeriodMillisecs = 43200000 ;         // 12 hours
Alloy.Globals.UrbioticaSensorsMaximumDistance = 15 ;                     // 15 km
Alloy.Globals.SearchParkingSpotsLoopPeriodMillisecs = 50000 ;            // 50 seconds

// Function to save the sessionId with the securely properties
// INPUT: the new sessionId
// OUTPUT: none
Alloy.Globals.SetSessionId = function( sessionId )
{
    properties.setString( 'session_id' , sessionId ) ;
} ;

// Function to save the rememberMePassword with the securely properties
// INPUT: the new rememberMePassword
// OUTPUT: none
Alloy.Globals.SetRememberMePassword = function( rememberMePassword )
{
    properties.setString( 'remember_me_password' , rememberMePassword ) ;
} ;

// Function to save the car latitude with the securely properties
// INPUT: the new car latitude
// OUTPUT: none
Alloy.Globals.SetMyCarLatitude = function( myCarLatitude )
{
    properties.setString( 'my_car_latitude' , myCarLatitude ) ;
} ;

// Function to save the Urbiotica authentication token with the securely properties
// INPUT: the new authentication token
// OUTPUT: none
Alloy.Globals.SetMyCarLongitude = function( myCarLongitude )
{
    properties.setString( 'my_car_longitude' , myCarLongitude ) ;
} ;

// Function to save the Urbiotica authentication token with the securely properties
// INPUT: the new authentication token
// OUTPUT: none
Alloy.Globals.SetUrbioticaAuthToken = function( urbioticaAuthToken )
{
    properties.setString( 'urbiotica_auth_token' , urbioticaAuthToken ) ;
} ;

// Function to get the current locale
// INPUT: none
// OUTPUT: the current locale (e.g. en-US, it-IT, es-ES)
Alloy.Globals.CurrentLocale = function()
{
    var sRet = "" ;

    if( Ti.Locale.currentLanguage == 'it' )
    {
        sRet = 'it-IT' ;
    }
    else if( Ti.Locale.currentLanguage == 'es' )
    {
        sRet = 'es-ES' ;
    }
    else
    {
        sRet = 'en-US' ;
    }

    return sRet ;
} ;

// Function to show a toast notification
// INPUT: customMessage to show (Please wait... in case no message is passed) and the duration of the toast message (ignored in Android! For iOS, default value in case no duration is passed)
// OUTPUT: none
Alloy.Globals.ToastNotification = function( customMessage , intervalMessageMilliseconds )
{
    if( OS_IOS )
    {
        // Window container
        var toastWin = Titanium.UI.createWindow(
        {
            fullscreen: true
        } ) ;

        // View
        var toastView = Titanium.UI.createView(
        {
            height: 150 ,
            width: 250 ,
            borderRadius: 10 ,
            backgroundColor: '#aaa' ,
            opacity: .7
        } ) ;
    
        toastWin.add( toastView ) ;
    
        // Message
        var messageLbl = Titanium.UI.createLabel(
        {
            text: customMessage && typeof( customMessage !== 'undefined' ) ? customMessage : L( 'generic_please_wait_text_msg' ) ,
            color: '#fff' ,
            width: 'auto' ,
            height: 'auto' ,
            textAlign: 'center' ,
            font:
            {
                fontFamily: 'Helvetica Neue' ,
                fontSize: 12 ,
                fontWeight: 'bold'
            }
        } ) ;
    
        toastView.add( messageLbl ) ;
        toastWin.open() ;
    
        intervalMessageMilliseconds = intervalMessageMilliseconds ? intervalMessageMilliseconds : Alloy.Globals.OpenToastNotificationDefaultTimeoutMillisecs ;
        setTimeout( function()
        {
            toastWin.close(
            {
                opacity: 0 ,
                duration: Alloy.Globals.CloseToastNotificationTimeoutMillisecs
            } ) ;
        } , intervalMessageMilliseconds ) ;
    }
    else
    {
        var toast = Ti.UI.createNotification(
        {
            message: customMessage && typeof( customMessage !== 'undefined' ) ? customMessage : L( 'generic_please_wait_text_msg' ) ,
            duration: Ti.UI.NOTIFICATION_DURATION_SHORT
        } ) ;
        toast.show() ;
    }
} ;

// Function to open a controller's view with a debounce protection from double clicks
// INPUT: the controller's name
// OUTPUT: none
Alloy.Globals.createAndOpenControllerExt = _.debounce( function( controller_name , array_params )
{
    var controller = null ;

    if( array_params && _.size( array_params ) > 0 )
    {
        controller = Alloy.createController( controller_name , array_params ) ;
    }
    else
    {
        controller = Alloy.createController( controller_name ) ;
    }
    controller.getView().open() ;

} , Alloy.Globals.CreateAndOpenControllerDebounceWaitPeriodMillisecs , true ) ;

// Function to open a controller's view with a debounce protection from double clicks
// INPUT: the controller's name
// OUTPUT: none
Alloy.Globals.openExistingControllerExt = _.debounce( function( controller )
{
    controller.getView().open() ;
} , Alloy.Globals.CreateAndOpenControllerDebounceWaitPeriodMillisecs , true ) ;

// Loads the map module, which can be referenced by Alloy.Globals.Map
Alloy.Globals.Map = require( 'ti.map' ) ;

var events = {} ;
// Function to safely add an event listener
// INPUT: the object that will try to add the event listener, the event name and the event handler itself
//        PAY ATTENTION THAT IT WORKS ONLY WITH IDENTICAL FUNCTION REFERENCE!!!!
// OUTPUT: none
Alloy.Globals.ProtectedAddEventListener = function( context , eventName , eventHandler )
{
    // If the context already exist and the eventHandler is already inside, nothing to do
    if( events[context] && events[context][eventName] === eventHandler )
    {
        return ;
    }
    else
    {
        // Creation of the space for this context, if necessary
        if( !events[context] )
        {
            events[context] = {} ;
        }

        // If the context for this eventName already exist but there is another eventHandler inside, we'll remove it before
        if( events[context][eventName] && events[context][eventName] !== eventHandler )
        {
            context.removeEventListener( eventName , events[context][eventName] ) ;
            events[context][eventName] = null ;
        }

        // Adding the eventHandler
        events[context][eventName] = eventHandler ;
        context.addEventListener( eventName , eventHandler ) ;
    }
} ;

// Function to safely remove an event listener
// INPUT: the object that will try to remove the event listener, the event name and the event handler itself
//        PAY ATTENTION THAT IT WORKS ONLY WITH IDENTICAL FUNCTION REFERENCE!!!!
// OUTPUT: none
Alloy.Globals.ProtectedRemoveEventListener = function( context , eventName , eventHandler )
{
    // If the context exist and the eventHandler is inside, we'll remove it
    if( events[context] && events[context][eventName] === eventHandler )
    {
        context.removeEventListener( eventName , eventHandler ) ;
        events[context][eventName] = null ;
    }
} ;

// Function to clean up an event listener, if necessary
// INPUT: the object that will try to remove the event listener and the event name
// OUTPUT: none
Alloy.Globals.ProtectedCleanUpEventListener = function( context , eventName )
{
    // If the context exist and the eventHandler is inside, we'll remove it
    if( events[context] && events[context][eventName] )
    {
        context.removeEventListener( eventName , events[context][eventName] ) ;
        events[context][eventName] = null ;
    }
} ;

// Function to reset the local session
// INPUT: none
// OUTPUT: none
Alloy.Globals.ResetSession = function()
{
    Alloy.Globals.SessionId = null ;
    properties.setString( 'session_id' , '' ) ;
    Alloy.Globals.SessionUsername = null ;
    Ti.App.Properties.setString( 'session_username' , '' ) ;
} ;

// Function to reset the local session
// INPUT: none
// OUTPUT: true if a local session exist, false otherwise
Alloy.Globals.ExistSession = function()
{
    var bRet = false ;

    if( Alloy.Globals.SessionId && Alloy.Globals.SessionUsername )
    {
        bRet = true ;
    }

    return bRet ;
} ;

// Function that creates a title based on the current authentication informations
// INPUT: none
// OUTPUT: the title based on the current authentication informations
Alloy.Globals.CurrentAuthenticationInfoTitle = function()
{
    var sRet = "" ;

    if( Alloy.Globals.ExistSession() )
    {
        sRet = L( 'generic_welcome_online_text_msg' ) + Alloy.Globals.SessionUsername + "!" ;
    }
    else
    {
        sRet = L( 'generic_welcome_offline_text_msg' ) ;
    }

    return sRet ;
} ;

// Function to reset the car location
// INPUT: none
// OUTPUT: none
Alloy.Globals.ResetMyCarLocation = function()
{
    Alloy.Globals.MyCarLatitude = null ;
    properties.setString( 'my_car_latitude' , '' ) ;
    Alloy.Globals.MyCarLongitude = null ;
    properties.setString( 'my_car_longitude' , '' ) ;
} ;

// N.B. getFileForRead & getFileForWrite:
//      From what I can tell, Titanium is not implementing this correctly. From what I can read, you need to call Context.externalFilesDir(), to get that special path. According to the Android documentation, this folder is removed upon uninstall.
//      In Titanium, the call to use is Ti.Filesystem.getExternalStorageDirectory(), but this does not entirely equal the Android Environment.getExternalStorageDirectory(), because Titanium appends the application package name.
//      This means that Ti.Filesystem.getExternalStorageDirectory returns appdata:// which is translated into something like /storage/sdcard0/com.example.testapp. This can be fine for some uses, where you want to preserve the data between application installs. If you intend the user to find the data, I would argue that you should use your apps displayname rather than the package name. You cannot get the Context.externalFilesDir() path from Titanium. You can discard the package name to get the equivalent of Environment.getExternalStorageDirectory().
//      My only solution to this was to roll a native module that simply provides access to these two system calls.
//      For devices that provides an internal SD card that is not removable (like Samsung devices), this approach will return this primary external SD card e not the inserted one.
//      I decided to not create any workaround to list the mounted points because they can change in future release of Android, so for now we accept to write in this internal SD card and not in the inserted one.
//      However, most the Android devices are following the Google specifications for this, so most of the Android devices are able to use the external SD card. For the others we must wait for future official fixing.

// Function to get a file from the file system for a reading purpose, with this behaviour:
// iOS - applicationDataDirectory only;
// Android - externalStorageDirectory first (if present), then applicationDataDirectory
// INPUT: the filename
// OUTPUT: the file if present, null otherwise
Alloy.Globals.getFileForRead = function( filename )
{
    var ret = null ;

    try
    {
        // Test if the External Storage is present (Android only)
        if( Ti.Filesystem.isExternalStoragePresent() )
        {
            ret = Ti.Filesystem.getFile( Ti.Filesystem.externalStorageDirectory , filename ) ;
            if( ret.exists() )
            {
                // OK
            }
            else
            {
                ret = null ;
            }
        }

        if( ret )
        {
            // OK
        }
        // No SD or iOS or missing file
        else
        {
            ret = Ti.Filesystem.getFile( Ti.Filesystem.applicationDataDirectory , filename ) ;
            if( ret.exists() )
            {
                // OK
            }
            else
            {
                ret = null ;
            }
        }
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
        ret = null ;
    }

    return ret ;
} ;

// Function to get a file from the file system for a writing purpose, with this behaviour:
// iOS - applicationDataDirectory only;
// Android - externalStorageDirectory first (if present), then applicationDataDirectory
// INPUT: the filename
// OUTPUT: the file
Alloy.Globals.getFileForWrite = function( filename )
{
    var ret = null ;

    try
    {
        // Test if the External Storage is present (Android only)
        if( Ti.Filesystem.isExternalStoragePresent() )
        {
            ret = Ti.Filesystem.getFile( Ti.Filesystem.externalStorageDirectory , filename ) ;
        }

        if( ret )
        {
            // OK
        }
        // No SD or iOS
        else
        {
            ret = Ti.Filesystem.getFile( Ti.Filesystem.applicationDataDirectory , filename ) ;
        }
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
        ret = null ;
    }

    return ret ;
} ;

// Function to replace a particular char in a string
// INPUT: the index where replace the char, the old string and the new char to insert
// OUTPUT: the new string with the replacement
Alloy.Globals.replaceCharAt = function( index , old_string , new_character )
{
    return old_string.substr( 0 , index ) + new_character + old_string.substr( index + 1 ) ;
} ;

// Function to log into the DB what happened
// INPUT: the error message to log
Alloy.Globals.LogMessage = function( error_message )
{
    var dateNow = new Date().toString() ;
    var errorsModel = Alloy.createModel( "Errors",
    {
        DATE: dateNow ,
        ERR_MSG: error_message
    } ) ;
    // Save model to our database. If the model already exists, the save will be an "update".
    errorsModel.save() ;
} ;

// Function to alert the user about an error and log into the DB what happened
// INPUT: the error message to show in the alert dialog
// OUTPUT: none
Alloy.Globals.AlertUserAndLogAsync = function( error_message )
{
    var dateNow = new Date().toString() ;
    var errorsModel = Alloy.createModel( "Errors",
    {
        DATE: dateNow ,
        ERR_MSG: error_message
    } ) ;
    // Save model to our database. If the model already exists, the save will be an "update".
    errorsModel.save() ;

    // AlertDialog for the user
    var alertDialog = Titanium.UI.createAlertDialog(
    {
        title: L( 'generic_error_title' ) ,
        message: error_message
    } ) ;
    // Show alert message for the error
    alertDialog.show() ;
} ;

// Function to hide a previous keyboard after a click
// INPUT: the window for attaching the click event and the textfield subjects of the blur of the keyboard
// OUTPUT: none
function RegisterHideKeyboard( window , textFields )
{
    window.addEventListener( "click" , function()
    {
        if( OS_ANDROID )
        {
            Ti.UI.Android.hideSoftKeyboard() ;
        }
        else
        {
            for( var i = 0 ; i < textFields.length ; i++ )
            {
                textFields[i].blur() ; // Hiding each keyboards
            }
        }
    } ) ;
}

// Function to protect the Window with a busy state for the passed action
// INPUT: an activity_indicator to show/hide, an array of controls to disable/enable, the function to execute during the busy state and the view current enable status
// OUTPUT: none
function BusyAction( activity_indicator , controls , busy_enable_function , view_enabled )
{
    var bRet = false ;

    if( busy_enable_function )
    {
        if( typeof view_enabled == 'undefined' || view_enabled == null )
        {
            view_enabled = true ;
        }

        try
        {
            // Disable controls
            if( controls )
            {
                for( var i = 0 ; i < controls.length ; i++ )
                {
                    controls[i].enabled = false ;
                }
            }

            // Show the activity indicator
            activity_indicator.show() ;

            // Function to execute during the busy state
            bRet = busy_enable_function() ;
        }
        catch( exception )
        {
            Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
        }
        finally
        {
            // Hide the activity indicator
            activity_indicator.hide() ;

            // Enable controls
            if( controls && view_enabled )
            {
                for( var i = 0 ; i < controls.length ; i++ )
                {
                    controls[i].enabled = true ;
                }
            }
        }

        return bRet ;
    }
}

// Function to protect the Window with a busy state for the passed action.
// This is for the beginning of an async calls, so EndAsyncBusyAction must be called after.
// IT SUPPORT MULTIPLES CALLING OF A BeginAsyncBusyAction BEFORE A EndAsyncBusyAction
// INPUT: an activity_indicator to show/hide, an array of controls to disbale/enable and the function to execute during the busy state
// OUTPUT: none
function BeginAsyncBusyAction( activity_indicator , controls , busy_enable_function , failed_callback )
{
    var bRet = false ;

    if( busy_enable_function )
    {
        try
        {
            // Disable controls
            if( controls )
            {
                for( var i = 0 ; i < controls.length ; i++ )
                {
                    controls[i].enabled = false ;
                }
            }

            // Show the activity indicator
            activity_indicator.show() ;

            // Function to execute during the busy state
            bRet = busy_enable_function() ;
        }
        catch( exception )
        {
            EndAsyncBusyAction( activity_indicator , controls ) ;
            if( failed_callback )
            {
                failed_callback() ;
            }

            Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
        }

        return bRet ;
    }
}

// Function to protect the Window with a busy state for the passed action.
// This is for the end of an async calls
// INPUT: an activity_indicator to hide, an array of controls to disbale/enable and the function to execute during the busy state
// OUTPUT: none
function EndAsyncBusyAction( activity_indicator , controls , callback )
{
    var bRet = false ;

    try
    {
        bRet = true ;
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
    }
    finally
    {
        // Hide the activity indicator
        activity_indicator.hide() ;

        // Enable controls
        if( controls )
        {
            for( var i = 0 ; i < controls.length ; i++ )
            {
                controls[i].enabled = true ;
            }
        }

        if( callback )
        {
            callback() ;
        }
    }

    return bRet ;
}

// Function to check if the passed table exists
// INPUT: the DB object in order to make the query and the table in check for the existence
// OUTPUT: true the table exists on the actual DB, false otherwise
Alloy.Globals.tableExists = function( dbObj , table )
{
    var bRet = false ;

    if( dbObj )
    {
        try
        {
            var rs = dbObj.execute( "SELECT count(*) FROM sqlite_master WHERE type = 'table' and name = '" + table + "';" ) ;
        }
        catch( exception )
        {

        }

        if( !rs || !rs.isValidRow() || rs.field(0) == 0 )
        {

        }
        else
        {
            bRet = true ;
        }

        rs.close() ;
    }
 
    return bRet ;
} ;

// Function to check if the current user is authorized to ask localization
// INPUT: nothing
// OUTPUT: true if we are authorized to ask localization, false otherwise
Alloy.Globals.isLocationAuthorized = function()
{
    var retVal = true ;

    // Check that we are allowed to use
    if( !Ti.Geolocation.locationServicesEnabled )
    {
        return false ;
    }

    // iOS devices can perform a further check on the authorization's state
    if( OS_IOS )
    {
        var authorization = Titanium.Geolocation.locationServicesAuthorization ;
    
        if( authorization == Titanium.Geolocation.AUTHORIZATION_DENIED )
        {
            // User has decided to not allow this use of location
            retVal = false ;
        }
        else if( authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED )
        {
            // A device restriction prevent us from using location services
            retVal = false ;
        }
        else
        {
            retVal = true ;
        }
    }
    else
    {
        retVal = true ;
    }

    return retVal ;
} ;

// Function to get the current heading
// INPUT: an associative array with a callback function inside success ( example: { success: setLabelText } )
// OUTPUT: none
Alloy.Globals.getHeading = function( _args )
{
    Ti.Geolocation.preferredProvider = Titanium.Geolocation.PROVIDER_GPS ;
    // For our purposes, we need high accuracy
    Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST ;
    Titanium.Geolocation.showCalibration = true ;
    Titanium.Geolocation.headingFilter = 0 ;

    Ti.Geolocation.addEventListener( 'heading' , _args.success ) ;
} ;

// Function to calculate the current magnetic heading (North, South, West, East)
// INPUT: the magnetic heading degrees and if the current calculation must be kept or reversed (North become South, East become West and so on)
// OUTPUT: the calculated magnetic heading (N, S, W, E)
Alloy.Globals.CalculateMagneticHeading = function( magnetic_heading , dont_reverse_result )
{
    var currentHeading = "" ;
    // North or East
    if( magnetic_heading <= 90 )
    {
        if( magnetic_heading <= 45 )
        {
            // North
            currentHeading = "N" ;
        }
        else
        {
            // East
            currentHeading = "E" ;
        }
    }
    // East or South
    else if( magnetic_heading <= 180 )
    {
        if( magnetic_heading <= 135 )
        {
            // East
            currentHeading = "E" ;
        }
        else
        {
            // South
            currentHeading = "S" ;
        }
    }
    // South or West
    else if( magnetic_heading <= 270 )
    {
        if( magnetic_heading <= 225 )
        {
            // South
            currentHeading = "S" ;
        }
        else
        {
            // West
            currentHeading = "W" ;
        }
    }
    // West or North
    else
    {
        if( magnetic_heading <= 315 )
        {
            // West
            currentHeading = "W" ;
        }
        else
        {
            // North
            currentHeading = "N" ;
        }
    }

    if( dont_reverse_result )
    {
        // Nothing to do
    }
    else
    {
        switch( currentHeading )
        {
            case "N":
            {
                currentHeading = "S" ;
            }
            break ;

            case "E":
            {
                currentHeading = "W" ;
            }
            break ;

            case "S":
            {
                currentHeading = "N" ;
            }
            break ;

            case "W":
            {
                currentHeading = "E" ;
            }
            break ;
        }
    }

    return currentHeading ;
} ;

// Function to get the current location (it's a best practice to check if we are authorized
// first, with the isLocationAuthorized function!)
// INPUT: an associative array with a callback function inside success ( example: { success: setLabelText } )
// OUTPUT: none, but the passed callback function (if passed) is raised if everything it's ok
Alloy.Globals.getLocation = function( _args )
{
    if( OS_IOS )
    {
        Ti.Geolocation.preferredProvider = Titanium.Geolocation.PROVIDER_GPS ;
        // For our purposes, we need high accuracy
        Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST ;
        Titanium.Geolocation.showCalibration = true ;
        Titanium.Geolocation.distanceFilter = 0 ;
    }
    else if( OS_ANDROID )
    {
        var providerGps = Ti.Geolocation.Android.createLocationProvider(
        {
            name: Ti.Geolocation.PROVIDER_GPS ,
            minUpdateDistance: 0.0 ,
            minUpdateTime: 0
        } ) ;
        Ti.Geolocation.Android.addLocationProvider( providerGps ) ;
        Ti.Geolocation.Android.manualMode = true ;
    }
    else
    {
        Ti.Geolocation.preferredProvider = Titanium.Geolocation.PROVIDER_GPS ;
        // For our purposes, we need high accuracy
        Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_HIGH ;
        Titanium.Geolocation.showCalibration = true ;
        Titanium.Geolocation.distanceFilter = 0 ;
    }

    Alloy.Globals.ProtectedAddEventListener( Ti.Geolocation , "location" , _args.success ) ;
} ;

var forwardGeocodeLoader = null ;
// Function to get the forward geocoding of an address and get latitude and longitude
// INPUT: address and callback to call when latitude and longitude are computed
// OUTPUT: none, but the passed callback function (if passed) is raised if everything is ok
Alloy.Globals.forwardGeocode = function( address , callback , callbackFailed )
{
    var addrUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address ;

    if( forwardGeocodeLoader )
    {
        // Without the abort function, sometimes the onload function returns the older results
        forwardGeocodeLoader.abort() ;
    }
    else
    {
        forwardGeocodeLoader = Titanium.Network.createHTTPClient() ;
    }
    forwardGeocodeLoader.onload = function()
    {
        var response = JSON.parse( this.responseText ) ;

        var formattedResponse = Alloy.Globals.formatForwardGeocodingAnswer( response ) ;
        if( formattedResponse['status'] == "OK" )
        {
            if( callback )
            {
                callback( formattedResponse['lat'] , formattedResponse['lng'] ) ;
            }
        }
        else
        {
            if( callbackFailed )
            {
                callbackFailed() ;
            }

            alert( L( 'unable_to_find_the_address_msg' ) ) ;
        }
    } ;
    forwardGeocodeLoader.open( "GET" , addrUrl ) ;
    forwardGeocodeLoader.send( null ) ;
} ;

// Function to parse and format the Google response of a forward geocoding
// INPUT: the received response from Google
// OUTPUT: an associative array with the formatted answer
Alloy.Globals.formatForwardGeocodingAnswer = function( response )
{
    var formattedAnswer = new Array() ;

    try
    {
        if( response.status == 'OK' )
        {
            formattedAnswer['street_number'] = "" ;
            formattedAnswer['route'] = "" ;
            formattedAnswer['administrative_area_level_1'] = "" ;
            formattedAnswer['administrative_area_level_2'] = "" ;
            formattedAnswer['country'] = "" ;
            formattedAnswer['postal_code'] = "" ;
            formattedAnswer['lng'] = "" ;
            formattedAnswer['lat'] = "" ;
            formattedAnswer['formatted_address'] = "" ;
            if( response.results && response.results.length > 0 )
            {
                var firstResult = response.results[0] ;
                if( firstResult.address_components && firstResult.address_components.length > 0 )
                {
                    for( var i = 0 ; i < firstResult.address_components.length ; i++ )
                    {
                        var currentElem = firstResult.address_components[i] ;
                        switch( currentElem.types[0] )
                        {
                            case 'street_number':
                            {
                                formattedAnswer['street_number'] = currentElem['long_name'] ;
                            }
                            break ;

                            case 'route':
                            {
                                formattedAnswer['route'] = currentElem['long_name'] ;
                            }
                            break ;

                            case 'locality':
                            {
                                formattedAnswer['locality'] = currentElem['long_name'] ;
                            }
                            break ;

                            case 'administrative_area_level_1':
                            {
                                formattedAnswer['administrative_area_level_1'] = currentElem['long_name'] ;
                            }
                            break ;

                            case 'administrative_area_level_2':
                            {
                                formattedAnswer['administrative_area_level_2'] = currentElem['long_name'] ;
                            }
                            break ;

                            case 'country':
                            {
                                formattedAnswer['country'] = currentElem['long_name'] ;
                            }
                            break ;

                            case 'postal_code':
                            {
                                formattedAnswer['postal_code'] = currentElem['long_name'] ;
                            }
                            break ;
                        }
                    }

                    if( firstResult.geometry && firstResult.geometry.location )
                    {
                        formattedAnswer['lng'] = firstResult.geometry.location.lng ;
                        formattedAnswer['lat'] = firstResult.geometry.location.lat ;

                        if( firstResult.formatted_address )
                        {
                            formattedAnswer['formatted_address'] = firstResult.formatted_address ;
                        }
                    }
                }

                formattedAnswer['status'] = 'OK' ;
            }
        }
        else
        {
            formattedAnswer['status'] = 'KO' ;
        }
    }
    catch( exception )
    {
        formattedAnswer['status'] = 'KO' ;
    }

    return formattedAnswer ;
} ;

// Function to understand if a sensor is inside the predetermined radius of the user
// INPUT: latitude and longitude of the location of the user and latitude and longitude of the sensor
// OUTPUT: an array with the result of the computation and the status of the function, in case of errors
Alloy.Globals.IsLocationFallingInsideSensorRadius = function( userLatitude , userLongitude , sensorLatitude , sensorLongitude )
{
    var arRet = null ;

    try
    {
        // Equation of circle: for any point (x,y) to fall within circle with center (x1, y1) and radius r units is (x-x1)^2 + (y - y1)^2 <= r^2
        // Basic problem is changing degrees of latitudes to longitudes, so here is solution, 1 degree = 111.12 km
        if( Math.pow( ( userLatitude - sensorLatitude ) * 111.12 , 2 ) + Math.pow( ( userLongitude - sensorLongitude ) * 111.12 , 2 ) <= Math.pow( Alloy.Globals.UrbioticaSensorsMaximumDistance , 2 ) )
        {
            arRet = { status: "success" , result: true } ;
        }
        else
        {
            arRet = { status: "success" , result: false } ;
        }
    }
    catch( exception )
    {
        arRet = { status: "failed" , result: false } ;
    }

    return arRet ;
} ;

if( OS_IOS )
{
    // Screen always on
    Ti.App.idleTimerDisabled = true ;

    Titanium.App.addEventListener( 'pause' , function()
    {
        Ti.App.fireEvent( 'app:paused' ) ;
    } ) ;

    Titanium.App.addEventListener( 'resumed' , function()
    {
        Ti.App.fireEvent( 'app:resumed' ) ;
    } ) ;
}
