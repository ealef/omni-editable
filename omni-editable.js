(function ($, console) {

    $.fn.omniEditable = function (options) {

        // private variables
        var EDIT_BTN_CLS = "editButton";
        var OK_BTN_CLS = "okButton";
        var CANCEL_BTN_CLS = "cancelButton";
        var EDITABLE_SPAN_CLS = "editableSpan";
        var TEXT_INPUT_CLS = "textInput";
        var EDIT_MODE_CLS = "editMode";
        var NORMAL_MODE_CLS = "normalMode";

        var EDIT_BTN_STYLE_CLS = "";
        var EDIT_BTN_TEXT = "Edit";
        var CANCEL_BTN_STYLE_CLS = "";
        var CANCEL_BTN_TEXT = "Cancel";
        var OK_BTN_STYLE_CLS = "";
        var OK_BTN_TEXT = "OK";
        var TEXT_INPUT_STYLE_CLS = "";
        var EDIT_MODE = "buttonAndDoubleClick"; //button | 
                                                //doubleClick | 
                                                //buttonAndButtonClick
       
        var internalOptions = [];

        function initializeOptions(options) {
            if (options != null) {
                internalOptions = options;
            }

            if (internalOptions.buttonClass !== undefined) {
                EDIT_BTN_STYLE_CLS = internalOptions.buttonClass;
                CANCEL_BTN_STYLE_CLS = internalOptions.buttonClass;
                OK_BTN_STYLE_CLS = internalOptions.buttonClass;
            } else {
                if (internalOptions.editButtonClass !== undefined) {
                    EDIT_BTN_STYLE_CLS = internalOptions.editButtonClass;
                }

                if (internalOptions.cancelButtonClass !== undefined) {
                    CANCEL_BTN_STYLE_CLS = internalOptions.cancelButtonClass;
                }

                if (internalOptions.okButtonClass !== undefined) {
                    OK_BTN_STYLE_CLS = internalOptions.okButtonClass;
                }
            }

            if (internalOptions.textInputClass !== undefined) {
                TEXT_INPUT_STYLE_CLS = internalOptions.textInputClass;
            }
            
            if (internalOptions.editButtonText !== undefined) {
                EDIT_BTN_TEXT = internalOptions.editButtonText;
            }

            if (internalOptions.cancelButtonText !== undefined) {
                CANCEL_BTN_TEXT = internalOptions.cancelButtonText;
            }

            if (internalOptions.okButtonText !== undefined) {
                OK_BTN_TEXT = internalOptions.okButtonText;
            }

            if (internalOptions.editMode !== undefined) {
                EDIT_MODE = internalOptions.editMode;
            }

            
        }
        // private methods
        var startEdit = function (e) {
            var $parent = $(this).parent();
            var $editableSpan = $parent.find("." + EDITABLE_SPAN_CLS);

			if (internalOptions.onStartEdit !== undefined) {
				internalOptions.onStartEdit(e, $parent, $editableSpan.html());
			}            

            if (!e.isPropagationStopped()) {
                var $cancelButton = $("<button>Cancel</button>")
						.text(CANCEL_BTN_TEXT)
						.attr("type", "button")
						.click(cancelEdit)
						.addClass(CANCEL_BTN_CLS + " " 
                                + EDIT_MODE_CLS + " " 
                                + CANCEL_BTN_STYLE_CLS)
						.insertAfter($editableSpan);
                var $okButton = $("<button></button>")
						.text(OK_BTN_TEXT)
						.attr("type", "button")
						.addClass(OK_BTN_CLS + " "
                        + EDIT_MODE_CLS + " "
                        + OK_BTN_STYLE_CLS)
						.click(acceptEdit)
						.insertAfter($editableSpan);
                var $input = $("<input type = 'text'/>")
						.attr("class", $parent.attr("class"))
						.addClass(TEXT_INPUT_CLS + " "
                                + EDIT_MODE_CLS + " "
                                + TEXT_INPUT_STYLE_CLS)
						.val($editableSpan.text())
						.prop("defaultValue", $editableSpan.text())
						.keyup(checkShortcuts)
						.insertBefore($editableSpan)
						.focus();

                $parent.find("." + NORMAL_MODE_CLS)
						.remove();
            } else {
                console.log("edit stopped");
            }
        };

        var acceptEdit = function (e) {
            exitEditMode(e, $(this), true);
        };

        var cancelEdit = function (e) {
            exitEditMode(e, $(this), false);
        };

        function exitEditMode(e, $clickedButton, keepChanges) {
            var $parent = $clickedButton.parent();

			var optionEvent = keepChanges ?
					internalOptions.onAcceptEdit :
					internalOptions.onCancelEdit;

			if (optionEvent !== undefined) {
				var input = $parent.find("." + TEXT_INPUT_CLS);

				optionEvent(
					e,
					$parent,
					input.val(),
					input.prop("defaultValue")
				);
			}

            if (!e.isPropagationStopped()) {
                revertEdit($parent, keepChanges);
            } else {
                if (keepChanges) {
                    console.log("accept stopped");
                } else {
                    console.log("cancel edit stopped");
                }
            }
        }

        function checkShortcuts(event) {
            var code = event.keyCode || event.which;
            var $parent = $(this).parent();

            switch (code) {
                case 13:	// ENTER
                    acceptEdit.call($parent.find("." + OK_BTN_CLS));
                    break;
                case 27:	// ESC
                    cancelEdit.call($parent.find("." + CANCEL_BTN_CLS));
                    break;
            }
        }

        function revertEdit($editable, keepChanges) {
            var spanHtml = keepChanges ?
					$editable.find("." + TEXT_INPUT_CLS).val() :
					$editable.find("." + TEXT_INPUT_CLS).prop("defaultValue");

            editableToNormalMode($editable,spanHtml);
        }

        function createSpan($editable, html) {
            var $span = $("<span></span>")
					.html(html)
					.addClass(
                        [
						    $editable.attr("class"),
						    EDITABLE_SPAN_CLS,
						    NORMAL_MODE_CLS
                        ].join(" "));

            if (EDIT_MODE != "button") {
                $span.dblclick(startEdit);
            } else {
                $span.css("cursor","default");
            }

            return $span;
        }

        function createEditButton($editable) {
            if (EDIT_MODE != "doubleClick") {
                var classes = EDIT_BTN_CLS + " "
                            + NORMAL_MODE_CLS + " "
                            + EDIT_BTN_STYLE_CLS;

                return $("<button></button>")
					    .text(EDIT_BTN_TEXT)
					    .attr("type", "button")
					    .addClass(classes)
					    .click(startEdit);
            } else {
                return "";
            }
        }

        function editableToNormalMode($editable, spanHtml) {           
            $editable.empty()
                    .append(createSpan($editable, spanHtml))
            		.append(createEditButton($editable))
            		.find("." + EDIT_MODE_CLS)
            		.remove();
        }

		function removeEditButton($editable) {
			$editable.find("." + EDIT_BTN_CLS).remove();
		}
		
		function editedText($editable) {
			return $editable.find("."+EDITABLE_SPAN_CLS).html();
		}		
        
		function decorate($editable)// public methods
		{
			$editable.removeEditButton = function () {
				removeEditButton($(this));
			};

			$editable.editedText = function () {
				return editedText($(this));          
			}
			return $editable;
		}
		
		this.each(function () {
			var $editable = $(this);
			var editableHtml = $editable.html();

            initializeOptions(options);
			editableToNormalMode($editable, editableHtml);
			decorate(this);		
		});
		
		return decorate(this);
    }
}(jQuery, false ? { log: function() { } } : console ));