$.init = function( text_msg , on_textfield_change , keyboardType , length_limit , maximum_number_value )
{
    try
    {
        // Set the text of the label (with a white space at the end to increase the offset
        // between the label and the TextField)
        $.lblAppTextField.setText( text_msg + ' ' ) ;
        // Set the hintText of the TextField
        $.txtAppTextField.setHintText( text_msg ) ;

        // Set the TextField change event handler
        if( on_textfield_change )
        {
            $.txtAppTextField.addEventListener( 'change' , on_textfield_change ) ;
        }

        // Set the keyboardType
        if( keyboardType )
        {
            $.txtAppTextField.setKeyboardType( keyboardType ) ;
            switch( keyboardType )
            {
                case Titanium.UI.KEYBOARD_NUMBER_PAD:
                {
                    // For the number keyboard, we also check that only numbers are inserted
                    $.txtAppTextField.addEventListener( 'change' , function( e )
                    {
                        var val = e.source.value ;
                        // If the value is greater than a maximum value (if is set), the new value must be the maximum one
                        if( maximum_number_value && parseInt( val ) > parseInt( maximum_number_value ) )
                        {
                            val = maximum_number_value ;
                            e.source.value = maximum_number_value ;
                        }
                        !!( /[^0-9]/.test(val) ) ? e.source.value = val.replace( /[^0-9]/gi , '' ) : false ;
                    } ) ;
                }
                break ;

                case Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION:
                {
                    // For the number keyboard, we also check that only numbers and punctuation are inserted
                    $.txtAppTextField.addEventListener( 'change' , function( e )
                    {
                        var val = e.source.value ;
                        !!( /[^0-9.\-\+]/.test(val) ) ? e.source.value = val.replace( /[^0-9.\-\+]/gi , '' ) : false ;
                    } ) ;
                }
                break ;
            }
        }

        // Set the maximum length
        if( length_limit )
        {
            $.txtAppTextField.setMaxLength( length_limit ) ;
        }
    }
    catch( exception )
    {
        alert( L( 'generic_exception_msg' ) + exception.message ) ;
    }
} ;

$.initPassword = function( text_msg )
{
    try
    {
        // Set the text of the label (with a white space at the end to increase the offset
        // between the label and the TextField)
        $.lblAppTextField.setText( text_msg + ' ' ) ;
        // Set the hintText of the TextField
        $.txtAppTextField.setHintText( text_msg ) ;
        // Enable the password mask
        $.txtAppTextField.setPasswordMask( true ) ;
    }
    catch( exception )
    {
        alert( L( 'generic_exception_msg' ) + exception.message ) ;
    }
} ;

$.get_text_field = function()
{
    var text_field_ret = null ;

    try
    {
        // Get the TextField
        text_field_ret = $.txtAppTextField ;
    }
    catch( exception )
    {
        alert( L( 'generic_exception_msg' ) + exception.message ) ;
    }

    return text_field_ret ;
} ;

$.get_text_value = function()
{
    var text_value_ret = "" ;

    try
    {
        // Get the value of the TextField
        text_value_ret = $.txtAppTextField.getValue() ;
    }
    catch( exception )
    {
        alert( L( 'generic_exception_msg' ) + exception.message ) ;
    }

    return text_value_ret ;
} ;

$.set_text_value = function( text_msg )
{
    try
    {
        // Set the value of the TextField
        $.txtAppTextField.setValue( text_msg ) ;
    }
    catch( exception )
    {
        alert( L( 'generic_exception_msg' ) + exception.message ) ;
    }
} ;

$.set_label_height = function( new_height )
{
    try
    {
        // Set the height of the label
        $.lblAppTextField.setHeight( new_height ) ;
    }
    catch( exception )
    {
        alert( L( 'generic_exception_msg' ) + exception.message ) ;
    }
} ;

$.blur = function()
{
    try
    {
        // Close the keyboard
        $.txtAppTextField.blur() ;
    }
    catch( exception )
    {
        alert( L( 'generic_exception_msg' ) + exception.message ) ;
    }
} ;

$.enabled = function( enabled )
{
    try
    {
        // Set the enabled value of the TextField
        $.txtAppTextField.setEditable( enabled ) ;
    }
    catch( exception )
    {
        alert( L( 'generic_exception_msg' ) + exception.message ) ;
    }
} ;
