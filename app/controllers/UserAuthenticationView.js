// Array of controls to disable/enable during a busy state
var controls = new Array() ;

controls.push( $.widgetAppButtonLogin.get_button() ) ;
controls.push( $.widgetAppButtonRegister.get_button() ) ;

// Android's physical back button click event handler
function OnAndroidBackButton_Click( e )
{
    // Nothing to do, we are forced to Register or Login
}

// Back function
function Back()
{
    try
    {
        controls = null ;

        // Remove the auth:done event listener, if necessary
        Alloy.Globals.ProtectedCleanUpEventListener( Ti.App , "auth:done" ) ;

        $.tabUserAuthentication.close() ;
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

// Login button click event handler
function OnBtnLogin_Click( e )
{
    try
    {
        if( Titanium.Network.networkType === Titanium.Network.NETWORK_NONE )
        {
            alert( L( 'generic_no_network_msg' ) ) ;
        }
        else
        {
            BeginAsyncBusyAction( $.activity_indicator_login , controls , function()
            {
                var bRet = false ;

                var loader = Titanium.Network.createHTTPClient() ;
                loader.validatesSecureCertificate = false ;

                // Runs the function when the data is ready for us to process
                loader.onload = function() 
                {
                    EndAsyncBusyAction( $.activity_indicator_login , controls ) ;

                    var json = this.responseText ;
                    var response = JSON.parse( json ) ;
                    if( response.OK == true && response.SessionID )
                    {
                        var sid = response.SessionID ;
                        Alloy.Globals.SessionId = sid ;
                        Alloy.Globals.SetSessionId( sid ) ;

                        var sUsername = response.Username ;
                        Alloy.Globals.SessionUsername = sUsername ;
                        Ti.App.Properties.setString( 'session_username' , sUsername ) ;

                        Alloy.Globals.RememberMeUsername = sUsername ;
                        Ti.App.Properties.setString( 'remember_me_username' , sUsername ) ;
                        var sPassword = $.widgetAppTextFieldLoginPassword.get_text_value() ;
                        Alloy.Globals.RememberMePassword = sPassword ;
                        Alloy.Globals.SetRememberMePassword( sPassword ) ;

                        Ti.App.fireEvent( "auth:done" ) ;
                        $.tabUserAuthentication.close() ;
                    }
                    else
                    {
                       switch( response.ErrorType )
                        {
                            case "LoginIncomplete":
                            {
                                alert( L( 'login_login_incomplete_text_msg' ) ) ;
                            }
                            break ;

                            case "ConnectionError":
                            {
                                alert( L( 'login_connection_error_text_msg' ) ) ;
                            }
                            break ;

                            case "InvalidLogin":
                            {
                                alert( L( 'login_invalid_login_text_msg' ) ) ;
                            }
                            break ;

                            case "UnexpectedError":
                            {
                                Alloy.Globals.AlertUserAndLogAsync( L( 'login_unexpected_error_text_msg' ) ) ;
                            }
                            break ;
                        }
                    }
                } ;
                 // Function called when an error occurs, including a timeout
                loader.onerror = function( e )
                {
                    EndAsyncBusyAction( $.activity_indicator_login , controls ) ;

                    Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + e.error ) ;
                } ;

                var params =
                {
                    // Key
                    key: "ParkAdvisor" ,
                    // Username
                    username: $.widgetAppTextFieldLoginUsername.get_text_value() ,
                    // Password
                    password: $.widgetAppTextFieldLoginPassword.get_text_value()
                } ;

                loader.timeout = Alloy.Globals.LoginRegistrationTimeoutMillisecs ;
                loader.open( "POST" , "https://www.parkadvisor.resiltronics.org/Login_Registration/Login_Registration.php?type=login" ) ;

                loader.send( params ) ;

                bRet = true ;

                return bRet ;
            } ) ;
        }
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

// Register button click event handler
function OnBtnRegister_Click( e )
{
    try
    {
        if( Titanium.Network.networkType === Titanium.Network.NETWORK_NONE )
        {
            alert( L( 'generic_no_network_msg' ) ) ;
        }
        else
        {
            BeginAsyncBusyAction( $.activity_indicator_register , controls , function()
            {
                var bRet = false ;

                var loader = Titanium.Network.createHTTPClient() ;
                loader.validatesSecureCertificate = false ;

                // Runs the function when the data is ready for us to process
                loader.onload = function() 
                {
                    EndAsyncBusyAction( $.activity_indicator_register , controls ) ;

                    var json = this.responseText ;
                    var response = JSON.parse( json ) ;
                    if( response.OK == true && response.SessionID )
                    {
                        var sid = response.SessionID ;
                        Alloy.Globals.SessionId = sid ;
                        Alloy.Globals.SetSessionId( sid ) ;

                        var sUsername = response.Username ;
                        Alloy.Globals.SessionUsername = sUsername ;
                        Ti.App.Properties.setString( 'session_username' , sUsername ) ;

                        Ti.App.fireEvent( "auth:done" ) ;
                        $.tabUserAuthentication.close() ;
                    }
                    else
                    {
                        switch( response.ErrorType )
                        {
                            case "Incomplete":
                            {
                                alert( L( 'register_incomplete_text_msg' ) ) ;
                            }
                            break ;

                            case "PasswordDontMatch":
                            {
                                alert( L( 'register_password_dont_match_text_msg' ) ) ;
                            }
                            break ;

                            case "ConnectionError":
                            {
                                alert( L( 'register_connection_error_text_msg' ) ) ;
                            }
                            break ;

                            case "UsernameAlreadyExist":
                            {
                                alert( L( 'register_username_already_exist_text_msg' ) ) ;
                            }
                            break ;

                            case "EmailAlreadyExist":
                            {
                                alert( L( 'register_email_already_exist_text_msg' ) ) ;
                            }
                            break ;

                            case "UnexpectedError":
                            {
                                Alloy.Globals.AlertUserAndLogAsync( L( 'register_unexpected_error_text_msg' ) ) ;
                            }
                            break ;

                            case "EmailNotValid":
                            {
                                alert( L( 'register_email_not_valid_text_msg' ) ) ;
                            }
                            break ;
                        }
                    }
                } ;
                 // Function called when an error occurs, including a timeout
                loader.onerror = function( e )
                {
                    EndAsyncBusyAction( $.activity_indicator_register , controls ) ;

                    Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + e.error ) ;
                } ;

                var currentLocale = "" ;
                if( Ti.Locale.currentLanguage == "es" )
                {
                    currentLocale = "es" ;
                }
                else if( Ti.Locale.currentLanguage == "it" )
                {
                    currentLocale = "it" ;
                }
                else
                {
                    currentLocale = "en" ;
                }

                var params =
                {
                    // Key
                    key: "ParkAdvisor" ,
                    // Name
                    name: $.widgetAppTextFieldRegisterName.get_text_value() ,
                    // Username
                    username: $.widgetAppTextFieldRegisterUsername.get_text_value() ,
                    // Email
                    email: $.widgetAppTextFieldRegisterEmail.get_text_value() ,
                    // Password
                    pass: $.widgetAppTextFieldRegisterPassword.get_text_value() ,
                    // Language
                    lang: currentLocale ,
                    // Password confirm
                    pass2: $.widgetAppTextFieldRegisterPasswordConfirm.get_text_value() ,
                } ;

                loader.timeout = Alloy.Globals.LoginRegistrationTimeoutMillisecs ;
                loader.open( "POST" , "https://www.parkadvisor.resiltronics.org/Login_Registration/Login_Registration.php?type=reg" ) ;

                loader.send( params ) ;

                bRet = true ;

                return bRet ;
            } ) ;
        }
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

try
{
    // Init controls
    // Init app textfields
    $.widgetAppTextFieldLoginUsername.init( L( 'generic_username_txt_hint' ) ) ;
    $.widgetAppTextFieldLoginPassword.initPassword( L( 'generic_password_txt_hint' ) ) ;
    $.widgetAppTextFieldRegisterUsername.init( L( 'generic_username_txt_hint' ) ) ;
    $.widgetAppTextFieldRegisterPassword.initPassword( L( 'generic_password_txt_hint' ) ) ;
    $.widgetAppTextFieldRegisterPasswordConfirm.initPassword( L( 'generic_password_confirm_txt_hint' ) ) ;
    $.widgetAppTextFieldRegisterName.init( L( 'generic_name_txt_hint' ) ) ;
    $.widgetAppTextFieldRegisterEmail.init( L( 'generic_email_txt_hint' ) ) ;
    // Init app buttons
    $.widgetAppButtonLogin.init( '/images/login_normal.png' , '/images/login_pressed.png' , '/images/login_disabled.png' , L( 'generic_login_title' ) , OnBtnLogin_Click ) ;
    $.widgetAppButtonRegister.init( '/images/register_normal.png' , '/images/register_pressed.png' , '/images/register_disabled.png' , L( 'generic_register_title' ) , OnBtnRegister_Click ) ;

    // Init Login controls with the remember me functionality
    $.widgetAppTextFieldLoginUsername.set_text_value( Alloy.Globals.RememberMeUsername ) ;
    $.widgetAppTextFieldLoginPassword.set_text_value( Alloy.Globals.RememberMePassword ) ;

    RegisterHideKeyboard( $.loginWindow ,
    [
        $.widgetAppTextFieldLoginUsername.get_text_field() ,
        $.widgetAppTextFieldLoginPassword.get_text_field()
    ] ) ;

    RegisterHideKeyboard( $.registerWindow ,
    [
        $.widgetAppTextFieldRegisterUsername.get_text_field() ,
        $.widgetAppTextFieldRegisterPassword.get_text_field() ,
        $.widgetAppTextFieldRegisterPasswordConfirm.get_text_field() ,
        $.widgetAppTextFieldRegisterName.get_text_field() ,
        $.widgetAppTextFieldRegisterEmail.get_text_field()
    ] ) ;

    $.tabUserAuthentication.open() ;
}
catch( exception )
{
    Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
}
