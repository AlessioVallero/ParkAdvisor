// Array of controls to disable/enable during a busy state
var controls = new Array() ;
if( OS_IOS )
{
    controls.push( $.searchViewCancel ) ;
}
controls.push( $.btn_target_on_parking ) ;
controls.push( $.btn_tag_my_car ) ;

var bCanClickOnTableView = true ;

var arAnnotations = {} ;

// Function when the Search button of the SearchBar is pressed
function OnSearchBar_Search()
{
    if( targetOnParkingEnabled )
    {
        // Close the keyboard
        $.searchView.blur() ;

        if( Titanium.Network.networkType === Titanium.Network.NETWORK_NONE )
        {
            alert( L( 'generic_no_network_msg' ) ) ;
        }
        else
        {
            BeginAsyncBusyAction( $.activity_indicator , controls , function()
            {
                var bRet = false ;

                bCanClickOnTableView = false ;

                $.searchView.enabled = false ;
                $.btn_search_here.enabled = false ;

                bAtLeastALocation = false ;
                QueryParkWhiz() ;
            
                // If a Token is present we will try to start the communication with Urbiotica with that token
                if( Alloy.Globals.UrbioticaAuthToken )
                {
                    // Query Urbiotica with an existing token
                    QueryUrbioticaWithoutLogin() ;
                }
                else
                {
                    // Query Urbiotica and starting the authentication process from the beginning
                    QueryUrbioticaByLogin() ;
                }

                bRet = true ;

                return bRet ;
            } , EndAsyncBusyAction_CallBack ) ;
        }
    }
} 

// Function when the Cancel button of the SearchBar is pressed
function OnSearchBar_Cancel()
{
    // Close the keyboard
    $.searchView.blur() ;
}

var currentUserLatitude = null ;
var currentUserLongitude = null ;
var currentAnnotationLatitude = null ;
var currentAnnotationLongitude = null ;

var currentMyCar = null ;

// Function when double clicking an annotation in the Map. Currently is not possible to receive this event clicking randomly in the map
function OnMap_Click( e )
{
    if( bCanClickOnTableView )
    {
        var bContinue = false ;
        if( OS_IOS )
        {
            if( e.clicksource == "rightButton" )
            {
                ManageAnnotationClick( e.annotation ) ;
            }
        }
        else
        {
            if( e.clicksource == "leftPane" )
            {
                ManageAnnotationClick( e.annotation ) ;
            }
        }
    }
}

var currentRegionLatitude = null ;
var currentRegionLongitude = null ;
// Function to save the new region, since in Android sometimes getRegion() return older results
function OnMap_Regionchanged( e )
{
    currentRegionLatitude = e.latitude ;
    currentRegionLongitude = e.longitude ;
}

// Function to manage a click on an annotation
function ManageAnnotationClick( annotation )
{
    currentAnnotationLatitude = annotation.latitude ;
    currentAnnotationLongitude = annotation.longitude ;

    // If the click is in the car annotation, we also ask the user if want to delete the car tag
    if( currentMyCar &&
        annotation.myId &&
        currentMyCar.myId == annotation.myId )
    {
        // OptionDialog to ask user about the type of action to do
        var optionDialog = Ti.UI.createOptionDialog(
        {
            title: L( 'annotation_action_title' ) ,
            cancel: 2 ,
            options: [ L( 'set_navigator_msg' ) , L( 'delete_tag_msg' ) , L( 'generic_cancel_btn_title' ) ] ,
            selectedIndex: 0
        } ) ;
        optionDialog.addEventListener( 'click' , function( e )
        {
            switch( e.index )
            {
                case 0:
                {
                    BeginAsyncRequestUserLocation( true ) ;
                }
                break ;

                case 1:
                {
                    $.map.removeAnnotation( currentMyCar ) ;

                    Alloy.Globals.ResetMyCarLocation() ;

                    currentMyCar = null ;
                }
                break ;
            }
        } ) ;
        // Show OptionDialog about the type of action to do
        optionDialog.show() ;
    }
    else
    {
        // AlertDialog to ask user if want to set the navigator
        var alertDialog = Titanium.UI.createAlertDialog(
        {
            title: L( 'set_navigator_msg' ) ,
            message: L( 'set_navigator_confirm_msg' ) ,             
            buttonNames: [ L( 'generic_yes_msg' ) , L( 'generic_no_msg' ) ] ,
            cancel: 1
        } ) ;
        alertDialog.addEventListener( 'click' , function( event )
        {
            if( event.index == 0 )
            {
                BeginAsyncRequestUserLocation( true ) ;
            }
        } ) ;
        // Show alert message for deleting the car tag
        alertDialog.show() ;
    }
}

var bFirstLocationRequest = true ;

var bLocationRequest = true ;
var locationRequestTimeout = null ;

// Function for the location request
function UpdateLocation( e )
{
    // Remove the location event listener (a timeout is occurred so we don't want the alert message followed by the correct location)
    Alloy.Globals.ProtectedRemoveEventListener( Ti.Geolocation , "location" , UpdateLocation ) ;

    if( locationRequestTimeout !== null )
    {
        // Clear a previous timeout, if exist
        clearTimeout( locationRequestTimeout ) ;

        locationRequestTimeout = null ;
    }

    if( !e.success || e.error )
    {
        return ;
    }

    if( e && e.coords )
    {
        var latitude = e.coords.latitude.toString() ;
        var longitude = e.coords.longitude.toString() ;

        currentUserLatitude = latitude ;
        currentUserLongitude = longitude ;

        // We search if there are parking spots
        if( bLocationRequest )
        {
            bLocationRequest = false ;

            // Centering the map to the user location (just for the first request)
            if( bFirstLocationRequest )
            {
                bFirstLocationRequest = false ;

                $.map.setRegion(
                {
                    latitude: latitude ,
                    longitude: longitude ,
                    latitudeDelta: 0.1 ,
                    longitudeDelta: 0.1
                } ) ;
            }

            if( Titanium.Network.networkType === Titanium.Network.NETWORK_NONE )
            {
                alert( L( 'generic_no_network_msg' ) ) ;
            }
            else
            {
                bAtLeastALocation = false ;
                // Ask for parking garage here
                QueryParkWhiz( latitude , longitude ) ;
    
                // If a Token is present we will try to start the communication with Urbiotica with that token
                if( Alloy.Globals.UrbioticaAuthToken )
                {
                    // Query Urbiotica with an existing token
                    QueryUrbioticaWithoutLogin( latitude , longitude ) ;
                }
                else
                {
                    // Query Urbiotica and starting the authentication process from the beginning
                    QueryUrbioticaByLogin( latitude , longitude ) ;
                }
            }
        }
        else
        {
            if( currentUserLatitude != null && currentUserLongitude != null &&
                currentAnnotationLatitude != null && currentAnnotationLongitude != null )
            {
                var urlToOpen = null ;
                if( OS_IOS )
                {
                    // Open the native iOS app for maps
                    urlToOpen = 'maps://' ;
                }
                else            
                {
                    // Open Google maps
                    urlToOpen = 'http://' ;
                }

                EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

                Ti.Platform.openURL( urlToOpen + 'maps.google.com/maps?saddr=' + currentUserLatitude + ',' + currentUserLongitude + '&daddr=' + currentAnnotationLatitude + "," + currentAnnotationLongitude ) ;
            }
            else
            {
                EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

                Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + L( 'no_user_location_err_msg' ) ) ;
            }
        }
    }
    else
    {
        Alloy.Globals.LogMessage( "Location coordinates empty!" ) ;
    }
}

var bAtLeastALocation = false ;
var bUrbioticaFinished = false ;
var bParkWhizFinished = false ;

// Function to manage the end of both the routine of searching parking spot of ParkWhiz and Urbiotica
function ManageParkingSpotSearchFinished()
{
    if( bParkWhizFinished && bUrbioticaFinished )
    {
        EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

        if( bAtLeastALocation )
        {
            // OK - Nothing to do
        }
        else
        {
            // Notifications are available only for logged users
            if( Alloy.Globals.ExistSession() )
            {
                Alloy.Globals.ToastNotification( L( 'generic_no_parking_spot_found_info_msg' ) , 2000 ) ;
            }
        }
    }
}

// Function to create a new annotation
function CreateNewAnnotation( latitude , longitude , image , title , subtitle , isMyCar , priceFormatted , availableSpots )
{
    var newID = null ;
    if( isMyCar )
    {
        // Nothing to do
    }
    else
    {
        newID = latitude.toString() + "_" + longitude.toString() ;
        if( newID in arAnnotations )
        {
            // Remove the previous annotation
            $.map.removeAnnotation( arAnnotations[newID].annotation ) ;
        }
    }

    var newAnnotation = Alloy.Globals.Map.createAnnotation(
    {
        id: newID ,
        latitude: latitude ,
        longitude: longitude ,
        image: image ,
        title: title ,
        subtitle: subtitle
    } ) ;

    if( typeof priceFormatted !== 'undefined' && priceFormatted != null )
    {
        newAnnotation.myPriceFormatted = priceFormatted ;
    }
    if( typeof availableSpots !== 'undefined' && availableSpots != null )
    {
        newAnnotation.myAvailableSpots = availableSpots ;
    }

    var leftView = null ;
    if( OS_IOS )
    {
        newAnnotation.setRightButton( Ti.UI.iPhone.SystemButton.INFO_LIGHT ) ;

        // iOS will use an ImageView
        leftView = Titanium.UI.createImageView(
        {
            image: '/images/navigator.png' ,
            width: 30 ,
            height: 30
        } ) ;
    }
    else
    {
        // Android will use a Button
        leftView = Ti.UI.createButton( { backgroundImage: '/images/navigator.png' } ) ;
    }
    newAnnotation.setLeftView( leftView ) ;

    $.map.addAnnotation( newAnnotation ) ;

    if( isMyCar )
    {
        newAnnotation.myId = 'car' ;
    }
    else
    {
        arAnnotations[newID] =
        {
            annotation: newAnnotation ,
            timestamp: new Date().getTime()
        } ;
    }

    return newAnnotation ;
}

var targetOnParkingEnabled = false ;
// Function to enable/disable the target in the screen
function OnBtnTargetOnParking_Click( e )
{
    if( targetOnParkingEnabled )
    {
        targetOnParkingEnabled = false ;

        // Enable the radar
        if( intervalSearchParkingSpots === null )
        {
            // Search the parking spots and schedule the next radar query
            SearchParkingSpots() ;

            intervalSearchParkingSpots = setInterval( SearchParkingSpots , Alloy.Globals.SearchParkingSpotsLoopPeriodMillisecs ) ;
        }

        // Disable the target buttons
        $.searchView.enabled = false ;
        $.btn_search_here.enabled = false ;

        // Change background images of the button
        $.btn_target_on_parking.setBackgroundImage( '/images/radar_for_parking_spot_normal.png' ) ;
        $.btn_target_on_parking.setBackgroundDisabledImage( '/images/radar_for_parking_spot_disabled.png' ) ;

        // Hide the target button by changing z-index
        $.map.zIndex = 2 ;
        $.targetOnParkingSpot.zIndex = 1 ;
    }
    else
    {
        targetOnParkingEnabled = true ;

        // Disable the radar
        StopIntervalSearchParkingSpots() ;

        // Enable the target buttons
        $.searchView.enabled = true ;
        $.btn_search_here.enabled = true ;

        // Change background images of the button
        $.btn_target_on_parking.setBackgroundImage( '/images/target_on_parking_spot_normal.png' ) ;
        $.btn_target_on_parking.setBackgroundDisabledImage( '/images/target_on_parking_spot_disabled.png' ) ;

        // Show the target button by changing z-index
        $.map.zIndex = 1 ;
        $.targetOnParkingSpot.zIndex = 2 ;
    }
}

// Function to search parking spots in the current location
function OnBtnSearchHere_Click( e )
{
    if( Titanium.Network.networkType === Titanium.Network.NETWORK_NONE )
    {
        alert( L( 'generic_no_network_msg' ) ) ;
    }
    else
    {
        if( currentRegionLatitude != null && currentRegionLongitude != null )
        {
            BeginAsyncBusyAction( $.activity_indicator , controls , function()
            {
                var bRet = false ;

                bCanClickOnTableView = false ;

                $.searchView.enabled = false ;
                $.btn_search_here.enabled = false ;

                bAtLeastALocation = false ;
                QueryParkWhiz( currentRegionLatitude , currentRegionLongitude ) ;
        
                // If a Token is present we will try to start the communication with Urbiotica with that token
                if( Alloy.Globals.UrbioticaAuthToken )
                {
                    // Query Urbiotica with an existing token
                    QueryUrbioticaWithoutLogin( currentRegionLatitude , currentRegionLongitude ) ;
                }
                else
                {
                    // Query Urbiotica and starting the authentication process from the beginning
                    QueryUrbioticaByLogin( currentRegionLatitude , currentRegionLongitude ) ;
                }

                bRet = true ;

                return bRet ;
            } , EndAsyncBusyAction_CallBack ) ;
        }
        else
        {
            Alloy.Globals.AlertUserAndLogAsync( L( 'generic_unexpected_error_text_msg' ) ) ;
        }
    }
}

// Function to tag our car in the current location
function OnBtnTagMyCar_Click( e )
{
    // Remove the previous tag on the car
    if( currentMyCar )
    {
        $.map.removeAnnotation( currentMyCar ) ;

        Alloy.Globals.ResetMyCarLocation() ;

        currentMyCar = null ;
    }

    // Create the annotation for the car
    currentMyCar = CreateNewAnnotation( currentUserLatitude , currentUserLongitude , '/images/current_car_location.png' , L( 'generic_my_car_text_msg' ) , '' , true ) ;

    // Save the location of the car in global variables, so the next time we start the app we can set the car location
    Alloy.Globals.MyCarLatitude = currentUserLatitude ;
    Alloy.Globals.SetMyCarLatitude( currentUserLatitude ) ;

    Alloy.Globals.MyCarLongitude = currentUserLongitude ;
    Alloy.Globals.SetMyCarLongitude( currentUserLongitude ) ;
}

// Help opening
function OpenHelp()
{
    try
    {
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

        var current_pdf_native_path = "http://www.parkadvisor.resiltronics.org/Manuals/ParkAdvisor_mobile_" + currentLocale + ".pdf" ;
        var current_pdf_name = "ParkAdvisor_mobile_" + currentLocale + ".pdf" ;

        // Get the PDF of the manual
        var file = Ti.Filesystem.getFile( Ti.Filesystem.getTempDirectory() , current_pdf_name ) ;
        if( file.exists() )
        {
            // AlertDialog to ask user if want to download a new version or use the previous version
            var alertDialog = Titanium.UI.createAlertDialog(
            {
                title: L( 'generic_help_download_new_version_title' ) ,
                message: L( 'help_download_new_version_confirm_msg' ) ,             
                buttonNames: [ L( 'generic_download_again_msg' ) , L( 'generic_use_this_version_msg' ) ] ,
                cancel: 1
            } ) ;
            alertDialog.addEventListener( 'click' , function( event_alert_download )
            {
                if( event_alert_download.index == 0 )
                {
                    // A previous .pdf will be dropped
                    file.deleteFile() ;

                    DownloadHelpInstructionManual( current_pdf_native_path , file ) ;
                }
                else if( event_alert_download.index == 1 )
                {
                    ViewPDF( file ) ;
                }
            } ) ;
            // Show alert message for saving
            alertDialog.show() ;
        }
        else
        {
            DownloadHelpInstructionManual( current_pdf_native_path , file ) ;
        }
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

// Download the instruction manual from the input url to the local_file
function DownloadHelpInstructionManual( current_pdf_url , local_file )
{
    if( Titanium.Network.networkType === Titanium.Network.NETWORK_NONE )
    {
        EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

        alert( L( 'generic_no_network_msg' ) ) ;
    }
    else
    {
        var client = Ti.Network.createHTTPClient(
        {
            onload: function()
            {
                local_file.write( this.responseData ) ;

                ViewPDF( local_file ) ;
            } ,
            onerror: function()
            {
                EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

                alert( L( 'manual_not_available_msg' ) ) ;
            }
        } ) ;
        client.open( 'GET' , current_pdf_url ) ;
        client.send() ;
    }
}

// View PDF from the local_file
function ViewPDF( local_file )
{
    // On iOS devices will be used the native documentViewer, on Android will be used an intent that open PDF reader instead
    // Also the top margin of the TableView must be different depending on the device type
    if( OS_IOS )
    {
        EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

        // Create a document viewer to preview a PDF file
        var docViewer = Ti.UI.iOS.createDocumentViewer(
        {
            url: local_file.nativePath
        } ) ;
        docViewer.show( { animated: true } ) ;
    }
    else
    {
        var intent = Ti.Android.createIntent(
        {
            action: Ti.Android.ACTION_VIEW ,
            type: "application/pdf" ,
            data: local_file.nativePath
        } ) ;

        try
        {
            $.helpWindow.getActivity().startActivityForResult( intent , function( event )
            {
                EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

                if( event.error )
                {
                    alert( L( 'manual_not_available_msg' ) ) ;
                }
            } ) ;
        }
        catch( exception )
        {
            EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

            alert( L( 'manual_not_available_msg' ) ) ;
        }
    }
}

// ChangeLanguage opening
function OpenChangeLanguage()
{
    try
    {
        Alloy.Globals.ProtectedAddEventListener( Ti.App , "language:changed" , RetranslateUI ) ;

        EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

        // Controller creation for the next View
        Alloy.Globals.createAndOpenControllerExt( 'ChangeLanguageView' ) ;
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

// Retranslate this View
function RetranslateUI( e )
{
    Alloy.Globals.ProtectedRemoveEventListener( Ti.App , "language:changed" , RetranslateUI ) ;

    // Translate developed by label
    $.lblDevelopedBy.setText( L( 'main_developed_by' ) ) ;
    // Translate search bar
    $.searchView.setHintText( L( 'generic_search_bar_txt_hint' ) ) ;
    if( OS_IOS )
    {
        $.searchViewCancel.setTitle( L( 'generic_cancel_title' ) ) ;
    }
    // Translate buttons
    $.btn_search_here.setTitle( L( 'main_search_here' ) ) ;
    $.btn_tag_my_car.setTitle( L( 'main_tag_my_car' ) ) ;

    var currentAnnotations = $.map.getAnnotations() ;
    if( currentAnnotations )
    {
        // The infowindow could be open, so we need to remove all the annotations and then add them again in order to avoid an exception
        $.map.removeAllAnnotations() ;
        // Translate annotations
        for( var i = 0 ; i < currentAnnotations.length ; i++ )
        {
            var currentAnn = currentAnnotations[i] ;
    
            // Translate my car annotation
            if( currentAnn.myId && currentAnn.myId == 'car' )
            {
                currentAnn.setTitle( L( 'generic_my_car_text_msg' ) ) ;
                currentMyCar = currentAnn ;
            }
            else
            {
                // Translate a normal annotation
                if( currentAnn.myPriceFormatted )
                {
                    currentAnn.setTitle( L( 'generic_price_txt_msg' ) + currentAnn.myPriceFormatted ) ;
                }
                if( currentAnn.myAvailableSpots )
                {
                    currentAnn.setSubtitle( L( 'generic_available_spots_txt_msg' ) + currentAnn.myAvailableSpots ) ;
                }
            }
            $.map.addAnnotation( currentAnn ) ;
        }
    }

    // Translate slide menù
    $.slideMenu.Nodes.removeEventListener( "click" , handleMenuClick ) ;
    $.slideMenu.clear() ;
    InitSlideMenu() ;
}

// SendErrors opening
function OpenSendErrors()
{
    try
    {
        // Recovering the errors from the DB
        var recoverErrors = Alloy.createCollection( 'Errors' ) ;
        recoverErrors.fetch(
        {
            query: "SELECT * FROM Errors"
        } ) ;

        // If any errors is present, we'll send them
        if( recoverErrors.length > 0 )
        {
            var errors = "" ;
            for( var i = 0 ; i < recoverErrors.length ; i++ )
            {
                var error = recoverErrors.at( i ) ;
                errors = errors + error.get( "DATE" ) + " " + error.get( "ERR_MSG" ) + "\n" ;
            }

            EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

            // Sending the errors by email
            var emailDialog = Ti.UI.createEmailDialog() ;
            if( emailDialog.isSupported() )
            {
                emailDialog.subject = L( "send_errors_email_dlg_subject" ) ;
                emailDialog.messageBody = errors ;
                emailDialog.toRecipients = ['parkadvisor@resiltronics.org'] ;
                emailDialog.addEventListener( 'complete' , function( e )
                {
                    // Check the mail is completely sent or not
                    if( e.result == emailDialog.SENT )
                    {
                        // Delete all the errors
                        while( recoverErrors.length > 0 )
                        {
                            var model = recoverErrors.at( 0 ) ;
                            recoverErrors.remove( model ) ;
                            model.destroy() ;
                        }
                    }
                } ) ;
                emailDialog.open() ;
            }
            else
            {
                alert( L( 'no_email_client_configured_msg' ) ) ;
            }
        }
        else
        {
            EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

            alert( L( 'no_errors_to_send_msg' ) ) ;
        }
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

// AboutUs opening
function OpenAboutUs()
{
    try
    {
        EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

        // Controller creation for the next View
        Alloy.Globals.createAndOpenControllerExt( 'AboutUsView' ) ;
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

// Handle the click event on a node
function handleMenuClick( _event )
{
    try
    {
        if( bCanClickOnTableView )
        {
            BeginAsyncBusyAction( $.activity_indicator , controls , function()
            {
                var bRet = false ;

                bCanClickOnTableView = false ;

                if( targetOnParkingEnabled )
                {
                    $.searchView.enabled = false ;
                    $.btn_search_here.enabled = false ;
                }

                // Open the corresponding controller
                switch( _event.row.id )
                {
                    case 0:
                    {
                        OpenHelp() ;
                    }
                    break ;

                    case 1:
                    {
                        OpenChangeLanguage() ;
                    }
                    break ;

                    case 2:
                    {
                        OpenSendErrors() ;
                    }
                    break ;

                    case 3:
                    {
                        OpenAboutUs() ;
                    }
                    break ;
                }

                bRet = true ;

                return bRet ;
            } , EndAsyncBusyAction_CallBack ) ;
        }
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

// Callback for EndAsyncBusyAction
function EndAsyncBusyAction_CallBack()
{
    bCanClickOnTableView = true ;

    if( targetOnParkingEnabled )
    {
        $.searchView.enabled = true ;
        $.btn_search_here.enabled = true ;
    }
}

var slider_menu_opened = false ;
function openMenu()
{
    $.appWrapper.animate(
    {
        left: "200dp" ,
        duration: 250 ,
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    } ) ;

    $.slideMenu.Wrapper.animate(
    {
        left: "0dp" ,
        duration: 250 ,
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    } ) ;

    slider_menu_opened = true ;
}

function closeMenu()
{
    $.appWrapper.animate(
    {
        left: "0dp" ,
        duration: 250 ,
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    } ) ;

    $.slideMenu.Wrapper.animate(
    {
        left: "-200dp" ,
        duration: 250 ,
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    } ) ;

    slider_menu_opened = false ;
}

function OnBtnSliderMenu_Click( e )
{
    if( slider_menu_opened )
    {
        closeMenu() ;
    }
    else
    {
        openMenu() ;
    }
}

function InitSlideMenu()
{
    // Create our node items
    var nodes =
    [
         { menuHeader: L( 'main_window_sections_slide_menu_title' ) , id: 0 , title: L( 'slider_menu_help_title' ) , image: "/images/slide_menu_help.png" } ,
         { id: 1 , title: L( 'slider_menu_change_language_title' ) , image: "/images/slide_menu_change_language.png" } ,
         { id: 2 , title: L( 'slider_menu_send_errors_title' ) , image: "/images/slide_menu_send_errors.png" } ,
         { id: 3 , title: L( 'slider_menu_about_us_title' ) , image: "/images/slide_menu_about_us.png" }
    ] ;

    // Initialize the slide menu
    $.slideMenu.init(
    {
        nodes: nodes,
        color:
        {
            headingBackground: "#000",
            headingText: "#FFF"
        }
    } ) ;

    // Add an event listener on the nodes
    $.slideMenu.Nodes.addEventListener( "click" , handleMenuClick ) ;
}

// Function to search the parking spots in the current user location
function SearchParkingSpots()
{
    try
    {
        // If we are here and the current mode is "Target" we shall stop this service because is useless
        if( targetOnParkingEnabled )
        {
            StopIntervalSearchParkingSpots() ;
        }
        else
        {
            var bContinue = true ;
            if( OS_ANDROID )
            {
                // On Android currently there isn't a generic event that allow to keep track if ParkAdvisor is in foreground or in background,
                // so we must use this module as a workaround
                var platformTools = require( 'bencoding.android.tools' ).createPlatform() ;
                bContinue = platformTools.isInForeground() ;
            }

            if( bContinue )
            {
                if( bCanClickOnTableView )
                {
                    bLocationRequest = true ;

                    // If we can ask for localization on this device
                    RequestUserLocation() ;
                }
            }
            else
            {
                // We are not foreground anymore, but a request to ParkWhiz is still pending. Abort.
                if( !bParkWhizFinished && queryParkWhizLoader )
                {
                    queryParkWhizLoader.abort() ;
                }
                // We are not foreground anymore, but a request to Urbiotica is still pending. Abort.
                if( !bUrbioticaFinished && queryUrbioticaLoader )
                {
                    queryUrbioticaLoader.abort() ;
                }
                // Stop the busy indicator
                EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;
            }
        }
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

// Function to completely stop the request of the current parking spots in the user's location
function StopIntervalSearchParkingSpots()
{
    if( intervalSearchParkingSpots !== null )
    {
        clearInterval( intervalSearchParkingSpots ) ;

        intervalSearchParkingSpots = null ;

        // Remove the location event listener (a timeout is occurred so we don't want the alert message followed by the correct location)
        Alloy.Globals.ProtectedRemoveEventListener( Ti.Geolocation , "location" , UpdateLocation ) ;

        if( locationRequestTimeout !== null )
        {
            // Clear a previous timeout, if exist
            clearTimeout( locationRequestTimeout ) ;

            locationRequestTimeout = null ;
        }

        // We are not foreground anymore, but a request to ParkWhiz is still pending. Abort.
        if( !bParkWhizFinished && queryParkWhizLoader )
        {
            queryParkWhizLoader.abort() ;
        }
        // We are not foreground anymore, but a request to Urbiotica is still pending. Abort.
        if( !bUrbioticaFinished && queryUrbioticaLoader )
        {
            queryUrbioticaLoader.abort() ;
        }

        // Stop the busy indicator
        EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;
    }
}

// To search for parking spots
var intervalSearchParkingSpots = null ;

// When ParkAdvisor is not active, SearchParkingSpots must be stopped
Ti.App.addEventListener( 'app:paused' ,function()
{
    StopIntervalSearchParkingSpots() ;
} ) ;

// When ParkAdvisor is active again, SearchParkingSpots must be started
Ti.App.addEventListener( 'app:resumed' , function()
{
    if( targetOnParkingEnabled || bAuthenticationPending )
    {
        // Nothing to do, no need to start the radar if the current mode is "Target"
    }
    else
    {
        // Enable the radar
        if( intervalSearchParkingSpots === null )
        {
            // Search the parking spots and schedule the next radar query
            SearchParkingSpots() ;

            intervalSearchParkingSpots = setInterval( SearchParkingSpots , Alloy.Globals.SearchParkingSpotsLoopPeriodMillisecs ) ;
        }
    }
} ) ;

// To clean the cache of the ParkWhiz results (as stated in their rules)
var intervalCleanParkWhizCache = setInterval( CleanParkWhizCache , Alloy.Globals.CleanParkWhizCacheLoopPeriodMillisecs ) ;

function CleanParkWhizCache()
{
    try
    {
        var currentTimestampUTC = new Date().getTime() ;
        for( var key in arAnnotations )
        {
            if( arAnnotations.hasOwnProperty( key ) )
            {
                // Delete results older than 24 hours
                if( currentTimestampUTC - 86400000 > arAnnotations[key].timestamp )
                {
                    $.map.removeAnnotation( arAnnotations[key].annotation ) ;

                    delete arAnnotations[key] ;
                }
            }
        }
    }
    catch( exception )
    {
        Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

var queryParkWhizLoader = null ;
// Function to query the ParkWhiz API in order to get the parking spots in the area (by latitude/longitude or the searchbar value)
function QueryParkWhiz( latitude , longitude )
{
    try
    {
        var searchViewValue = null ;
        // If the parameters latitude and longitude are set, we use them. Otherwise we use the address set in the SearchBar
        if( latitude && longitude )
        {
            searchViewValue = "lat=" + latitude + "&lng=" + longitude ;
        }
        else
        {
            if( $.searchView.getValue() )
            {
                searchViewValue = "destination=" + $.searchView.getValue().replace( " " , "+" ) ;
            }
        }

        if( searchViewValue )
        {
            bParkWhizFinished = false ;

            if( queryParkWhizLoader )
            {
                // Without the abort function, sometimes the onload function returns the older results
                queryParkWhizLoader.abort() ;
            }
            else
            {
                queryParkWhizLoader = Titanium.Network.createHTTPClient() ;
            }
            queryParkWhizLoader.validatesSecureCertificate = false ;

            // Runs the function when the data is ready for us to process
            queryParkWhizLoader.onload = function() 
            {
                var json = this.responseText ;
                var response = JSON.parse( json ) ;

                if( queryParkWhizLoader.status == 200 )
                {
                    if( response.locations && response.locations > 0 )
                    {
                        bAtLeastALocation = true ;

                        if( "parking_listings" in response )
                        {
                            // For each parking spot, we will create an annotation
                            for( var i = 0 ; i < response.locations ; i++ )
                            {
                                // Test if the location is really present (external API so we still have to be careful)
                                if( typeof response.parking_listings[i] !== 'undefined' && response.parking_listings[i] !== null &&
                                    typeof response.parking_listings[i].lat !== 'undefined' && response.parking_listings[i].lat !== null &&
                                    typeof response.parking_listings[i].lng !== 'undefined' && response.parking_listings[i].lng !== null )
                                {
                                    // Create a new annotation for the garage
                                    CreateNewAnnotation( response.parking_listings[i].lat ,
                                                         response.parking_listings[i].lng ,
                                                         '/images/garage.png' ,
                                                         L( 'generic_price_txt_msg' ) + response.parking_listings[i].price_formatted ,
                                                         L( 'generic_available_spots_txt_msg' ) + response.parking_listings[i].available_spots ,
                                                         false ,
                                                         response.parking_listings[i].price_formatted ,
                                                         response.parking_listings[i].available_spots ) ;
                                }
                            }
                        }
                    }
                }

                bParkWhizFinished = true ;

                ManageParkingSpotSearchFinished() ;
            } ;
             // Function called when an error occurs, including a timeout
            queryParkWhizLoader.onerror = function( event )
            {
                bParkWhizFinished = true ;

                ManageParkingSpotSearchFinished() ;

                Alloy.Globals.LogMessage( L( 'generic_exception_msg' ) + event.error ) ;
            } ;

            queryParkWhizLoader.timeout = Alloy.Globals.QueryParkWhizTimeoutMillisecs ;
            queryParkWhizLoader.open( "GET" , "https://api.parkwhiz.com/search/?" + searchViewValue + "&key=f95297f8d5390160cdfa167a18f3a32f" ) ;
            queryParkWhizLoader.send() ;
        }
        else
        {
            bParkWhizFinished = true ;

            ManageParkingSpotSearchFinished() ;

            Alloy.Globals.LogMessage( 'Urbiotica - Address not available in the SearchBar!' ) ;
        }
    }
    catch( exception )
    {
        bParkWhizFinished = true ;

        ManageParkingSpotSearchFinished() ;

        Alloy.Globals.LogMessage( L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

var retryAuthCounter = 0 ;

// Function called when an error occurred in the Urbiotica's loader
function ManageUrbioticaError( latitude , longitude , check_forbidden_status , error_message )
{
    if( check_forbidden_status && retryAuthCounter < 3 && queryUrbioticaLoader.status == 403 )
    {
        // Redo the authentication & restart the process
        retryAuthCounter++ ;
        QueryUrbioticaByLogin( latitude , longitude ) ;
    }
    else
    {
        retryAuthCounter = 0 ;

        bUrbioticaFinished = true ;

        ManageParkingSpotSearchFinished() ;

        if( error_message )
        {
            Alloy.Globals.LogMessage( L( 'generic_exception_msg' ) + error_message ) ;
        }
        else
        {
            Alloy.Globals.AlertUserAndLogAsync( L( 'generic_unexpected_error_text_msg' ) ) ;
        }
    }
}

var queryUrbioticaLoader = null ;
// Function to query the Urbiotica REST API in order to get the parking spots for the installed sensors (by latitude/longitude or the searchbar value)
function QueryUrbioticaByLogin( latitude , longitude )
{
    try
    {
        bUrbioticaFinished = false ;

        if( queryUrbioticaLoader )
        {
            // Without the abort function, sometimes the onload function returns the older results
            queryUrbioticaLoader.abort() ;
        }
        else
        {
            queryUrbioticaLoader = Titanium.Network.createHTTPClient() ;
        }
        queryUrbioticaLoader.validatesSecureCertificate = false ;

        // Runs the function when the data is ready for us to process
        queryUrbioticaLoader.onload = function() 
        {
            var json = this.responseText ;
            var response = JSON.parse( json ) ;

            if( queryUrbioticaLoader.status == 200 && response.status == "success" && "result" in response )
            {
                retryAuthCounter = 0 ;

                // Set the authentication token
                Alloy.Globals.UrbioticaAuthToken = response.result ;
                Alloy.Globals.SetUrbioticaAuthToken( response.result ) ;
                // Continue with the Urbiotica's process
                QueryUrbioticaWithoutLogin( latitude , longitude ) ;
            }
            else
            {
                ManageUrbioticaError( latitude , longitude , true ) ;
            }
        } ;
         // Function called when an error occurs, including a timeout
        queryUrbioticaLoader.onerror = function( event )
        {
            ManageUrbioticaError( latitude , longitude , true , event.error ) ;
        } ;

        queryUrbioticaLoader.timeout = Alloy.Globals.QueryUrbioticaTimeoutMillisecs ;
        queryUrbioticaLoader.open( "GET" , "http://services.urbiotica.net/external/login/fabrizio.ozzello@studenti.polito.it/fabri.polito" ) ;
        queryUrbioticaLoader.send() ;
    }
    catch( exception )
    {
        ManageUrbioticaError( latitude , longitude , false , exception.message ) ;
    }
}

// Function to query the Urbiotica REST API (without logging in) in order to get the parking spots for the installed sensors (by latitude/longitude or the searchbar value)
function QueryUrbioticaWithoutLogin( latitude , longitude )
{
    try
    {
        bUrbioticaFinished = false ;

        if( typeof latitude !== 'undefined' && latitude !== null &&
            typeof longitude !== 'undefined' && longitude !== null )
        {
            if( queryUrbioticaLoader )
            {
                // Without the abort function, sometimes the onload function returns the older results
                queryUrbioticaLoader.abort() ;
            }
            else
            {
                queryUrbioticaLoader = Titanium.Network.createHTTPClient() ;
            }
            queryUrbioticaLoader.validatesSecureCertificate = false ;

            // GET AVAILABLE PROJECTS FOR A GIVEN USER

            // Runs the function when the data is ready for us to process
            queryUrbioticaLoader.onload = function() 
            {
                var json = this.responseText ;
                var response = JSON.parse( json ) ;

                if( queryUrbioticaLoader.status == 200 && response.status == "success" &&
                    "result" in response &&
                    response.result &&
                    response.result.length > 0 )
                {
                    retryAuthCounter = 0 ;

                    var bStarterKitPolitecnicoDiTorinoFound = false ;
                    for( var i = 0 ; i < response.result.length ; i++ )
                    {
                        if( response.result[i].name == "Starter Kit Politecnico di Torino" && 
                            response.result[i].projectId )
                        {
                            bStarterKitPolitecnicoDiTorinoFound = true ;

                            // Continue with the Urbiotica's process
                            QueryUrbioticaLocations( latitude , longitude , response.result[i].projectId ) ;

                            break ;
                        }
                    }

                    if( bStarterKitPolitecnicoDiTorinoFound )
                    {
                        // Nothing to do
                    }
                    else
                    {
                        ManageUrbioticaError( latitude , longitude , false ) ;
                    }
                }
                else
                {
                    ManageUrbioticaError( latitude , longitude , true ) ;
                }
            } ;
             // Function called when an error occurs, including a timeout
            queryUrbioticaLoader.onerror = function( event )
            {
                ManageUrbioticaError( latitude , longitude , true , event.error ) ;
            } ;

            queryUrbioticaLoader.timeout = Alloy.Globals.QueryUrbioticaTimeoutMillisecs ;
            queryUrbioticaLoader.open( "GET" , "http://services.urbiotica.net/external/projects" ) ;
            // Header with the authentication token
            queryUrbioticaLoader.setRequestHeader( "IDENTITY_KEY" , Alloy.Globals.UrbioticaAuthToken ) ;
            queryUrbioticaLoader.send() ;
        }
        else
        {
            // If the coordinates are null, we should get them by the address, using the Google Forward Geocoding API
            if( $.searchView.getValue() )
            {
                Alloy.Globals.forwardGeocode( $.searchView.getValue().replace( " " , "+" ) , QueryUrbioticaWithoutLogin , function()
                {
                    ManageUrbioticaError( latitude , longitude , false , L( 'unable_to_find_the_address_msg' ) ) ;
                } ) ;
            }
            else
            {
                ManageUrbioticaError( latitude , longitude , false , 'Urbiotica - Address not available in the SearchBar!' ) ;
            }
        }
    }
    catch( exception )
    {
        ManageUrbioticaError( latitude , longitude , false , L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

// Function to query the Urbiotica REST API (without logging in) in order to get the the locations
function QueryUrbioticaLocations( latitude , longitude , projectId )
{
    try   
    {
        if( queryUrbioticaLoader )
        {
            // Without the abort function, sometimes the onload function returns the older results
            queryUrbioticaLoader.abort() ;
        }
        else
        {
            queryUrbioticaLoader = Titanium.Network.createHTTPClient() ;
        }
        queryUrbioticaLoader.validatesSecureCertificate = false ;

        // GET LOCATIONS FROM ZONE

        // Runs the function when the data is ready for us to process
        queryUrbioticaLoader.onload = function() 
        {
            var json = this.responseText ;
            var response = JSON.parse( json ) ;

            if( queryUrbioticaLoader.status == 200 && response.status == "success" &&
                "result" in response )
            {
                retryAuthCounter = 0 ;

                if( response.result &&
                    response.result.length > 0 )
                {
                    for( var i = 0 ; i < response.result.length ; i++ )
                    {
                        // Check if the sensor is inside the predetermined radius of the user, because otherwise the parking is too far
                        var arIsLocationFallingInsideOurRadius = Alloy.Globals.IsLocationFallingInsideSensorRadius( latitude ,
                                                                                                                    longitude ,
                                                                                                                    response.result[i].latitude ,
                                                                                                                    response.result[i].longitude ) ;
                        if( arIsLocationFallingInsideOurRadius.status == "success" )
                        {
                            if( arIsLocationFallingInsideOurRadius.result )
                            {
                                // Create the annotation for the sensor
                                if( response.result[i].lastValue &&
                                    response.result[i].lastValue == '0' )
                                {
                                    bAtLeastALocation = true ;

                                    // Free spot
                                    CreateNewAnnotation( response.result[i].latitude ,
                                                         response.result[i].longitude ,
                                                         '/images/parking_spot_available.png' ,
                                                         L( 'generic_price_txt_msg' ) + L( 'generic_free_text_msg' ) ,
                                                         L( 'generic_available_spots_txt_msg' ) + '1' ,
                                                         false ,
                                                         L( 'generic_free_text_msg' ) ,
                                                         '1' ) ;
                                }
                                else
                                {
                                    // Busy spot
                                    CreateNewAnnotation( response.result[i].latitude ,
                                                         response.result[i].longitude ,
                                                         '/images/parking_spot_not_available.png' ,
                                                         L( 'generic_price_txt_msg' ) + L( 'generic_free_text_msg' ) ,
                                                         L( 'generic_available_spots_txt_msg' ) + '0' ,
                                                         false ,
                                                         L( 'generic_free_text_msg' ) ,
                                                         '0' ) ;
                                }
                            }
                        }
                        else
                        {
                            Alloy.Globals.AlertUserAndLogAsync( L( 'generic_unexpected_error_text_msg' ) ) ;
                        }
                    }
                }

                bUrbioticaFinished = true ;

                ManageParkingSpotSearchFinished() ;
            }
            else
            {
                ManageUrbioticaError( latitude , longitude , true ) ;
            }
        } ;
         // Function called when an error occurs, including a timeout
        queryUrbioticaLoader.onerror = function( event )
        {
            ManageUrbioticaError( latitude , longitude , true , event.error ) ;
        } ;

        queryUrbioticaLoader.timeout = Alloy.Globals.QueryUrbioticaTimeoutMillisecs ;
        queryUrbioticaLoader.open( "GET" , "http://services.urbiotica.net/external/locations/zone/" + projectId + "/*?type=sensor" ) ;
        // Header with the authentication token
        queryUrbioticaLoader.setRequestHeader( "IDENTITY_KEY" , Alloy.Globals.UrbioticaAuthToken ) ;
        queryUrbioticaLoader.send() ;
    }
    catch( exception )
    {
        ManageUrbioticaError( latitude , longitude , false , L( 'generic_exception_msg' ) + exception.message ) ;
    }
}

// Function to request the current user's location and protect the process with the busy indicator
function BeginAsyncRequestUserLocation( bAvoidSetInterval )
{
    Alloy.Globals.ProtectedRemoveEventListener( Ti.App , "auth:done" , BeginAsyncRequestUserLocation ) ;

    BeginAsyncBusyAction( $.activity_indicator , controls , function()
    {
        var bRet = false ;

        bCanClickOnTableView = false ;

        if( targetOnParkingEnabled )
        {
            $.searchView.enabled = false ;
            $.btn_search_here.enabled = false ;
        }

        RequestUserLocation() ;

        bRet = true ;

        return bRet ;

    } , EndAsyncBusyAction_CallBack ) ;

    if( typeof bAvoidSetInterval === 'boolean' && bAvoidSetInterval )
    {
        // Nothing to do
    }
    else
    {
        bAuthenticationPending = false ;

        // Enable the radar
        if( intervalSearchParkingSpots === null )
        {
            intervalSearchParkingSpots = setInterval( SearchParkingSpots , Alloy.Globals.SearchParkingSpotsLoopPeriodMillisecs ) ;
        }
    }
}

// Function to request the current user's location
function RequestUserLocation()
{
    if( Alloy.Globals.isLocationAuthorized() )
    {
        // Start a new timeout for the location request
        locationRequestTimeout = setTimeout( function()
        {
            locationRequestTimeout = null ;

            // Remove the location event listener (a timeout is occurred so we don't want the alert message followed by the correct location)
            Alloy.Globals.ProtectedRemoveEventListener( Ti.Geolocation , "location" , UpdateLocation ) ;

            // Stop the busy indicator
            EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

            alert( L( 'geolocation_timeout_occurred_err_msg' ) ) ;
        } , Alloy.Globals.GeolocationRequestTimeoutMillisecs ) ;

        Alloy.Globals.getLocation(
        {
            success: UpdateLocation
        } ) ;
    }
    else
    {
        EndAsyncBusyAction( $.activity_indicator , controls , EndAsyncBusyAction_CallBack ) ;

        alert( L( 'generic_user_not_authorized_to_ask_localization' ) ) ;
    }
}

var bAuthenticationPending = true ;

try
{
    InitSlideMenu() ;

    if( OS_ANDROID )
    {
        var isGooglePlayServicesAvailable = Alloy.Globals.Map.isGooglePlayServicesAvailable() ;
        switch( isGooglePlayServicesAvailable )
        {
            case Alloy.Globals.Map.SUCCESS:
            {
                // OK
            }
            break ;

            case Alloy.Globals.Map.SERVICE_MISSING:
            {
                Alloy.Globals.AlertUserAndLogAsync( L( 'google_play_service_missing_msg' ) ) ;
            }
            break ;

            case Alloy.Globals.Map.SERVICE_VERSION_UPDATE_REQUIRED:
            {
                Alloy.Globals.AlertUserAndLogAsync( L( 'google_play_service_out_of_date_msg' ) ) ;
            }
            break ;

            case Alloy.Globals.Map.SERVICE_DISABLED:
            {
                Alloy.Globals.AlertUserAndLogAsync( L( 'google_play_service_disabled_msg' ) ) ;
            }
            break ;

            case Alloy.Globals.Map.SERVICE_INVALID:
            {
                Alloy.Globals.AlertUserAndLogAsync( L( 'google_play_service_cannot_be_authenticated_msg' ) ) ;
            }
            break ;

            default:
            {
                Alloy.Globals.AlertUserAndLogAsync( L( 'generic_unexpected_error_err_msg' ) ) ;
            }
            break ;
        }
    }

    if( Alloy.Globals.MyCarLatitude && Alloy.Globals.MyCarLongitude )
    {
        // Create the annotation for the car
        currentMyCar = CreateNewAnnotation( Alloy.Globals.MyCarLatitude , Alloy.Globals.MyCarLongitude , '/images/current_car_location.png' , L( 'generic_my_car_text_msg' ) , '' , true ) ;
    }

    $.map.addEventListener( 'regionchanged' , OnMap_Regionchanged ) ;

    // Window opening
    $.mainWindow.open() ;

    if( Alloy.Globals.ExistSession() )
    {
        // If a local session exist, for sure we've also answered to the location permission request
        BeginAsyncRequestUserLocation() ;
    }
    else
    {
        Alloy.Globals.ProtectedAddEventListener( Ti.App , "auth:done" , BeginAsyncRequestUserLocation ) ;

        Alloy.Globals.createAndOpenControllerExt( 'UserAuthenticationView' ) ;
    }
}
catch( exception )
{
    Alloy.Globals.AlertUserAndLogAsync( L( 'generic_exception_msg' ) + exception.message ) ;
}
