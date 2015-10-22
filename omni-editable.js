(function ($, console) {

    $.fn.omniEditable = function (options) {

        /* Constants*/

        var EDITABLE_SPAN_CLS = "editableSpan";
        var TEXT_INPUT_CLS = "textInput";
        var EDIT_MODE_CLS = "editMode";
        var NORMAL_MODE_CLS = "normalMode";
        
        /* Enumeratons */

        var modeEnum = {
            NORMAL: 0,
            EDIT:1
        }

        var editModeEnum = {
            BUTTON: 0,
            DOUBLE_CLICK: 1,
            BUTTON_AND_DOUBLE_CLICK: 2
        };

        /* Object Constructors */

        function Button(cssClass,
                        internalClass,
                        text,
                        visible,
                        onClick,
                        mode) {
            this.cssClass = cssClass;
            this.internalClass = internalClass;
            this.text = text;
            this.visible = visible;
            this.onClick = onClick;
            this.mode = mode;
            
            this.create=function() {
                if (this.visible) {
                    
                    console.log(this.text);
                    console.log(this.cssClass);
                   
                    var classes = " " + this.internalClass + " "
                            + this.cssClass + " "
                            + ((this.mode===modeEnum.EDIT)?EDIT_MODE_CLS:NORMAL_MODE_CLS) + " ";
                    console.log(classes);
                    return $("<button></button>")
                            .text(this.text)
                            .attr("type", "button")
                            .addClass(classes)
                            .click(this.onClick);
                } else {
                    debugger
                    return "";
                }
            };

            this.initializeFromOptions=function(optionButton, generalButtonCls) {
                if (optionButton !== undefined) {
                    if (optionButton.visible!=undefined) 
                        this.visible = optionButton.visible;

                    if (optionButton.text != undefined) 
                        this.text = optionButton.text;

                    // If a general buttonClass options is given , then it 
                    // is used for the buttons that the class is not specified.
                    if (optionButton.cssClass != undefined) {
                        this.cssClass = optionButton.cssClass;
                    } else {
                        this.cssClass = generalButtonCls;
                    }
                }
            }
        }

        /* Private Variables */
        var editBtn;
        var okBtn;
        var cancelBtn;
        var duplicateBtn;
        var removeBtn;

        var textInputStyleCls = "";
        
        var editMode = editModeEnum.BUTTON_AND_DOUBLE_CLICK;
       
       

        var internalOptions = [];
        
        /* Private Methods*/
        function initializeOptions(options) {
            var buttonClass = "";

            if (options != null) {
                internalOptions = options;
            }

            if (internalOptions.textInputClass !== undefined) {
                textInputStyleCls = internalOptions.textInputClass;
            }

            if (internalOptions.editMode !== undefined) {
                editMode = internalOptions.editMode;
            }

            if (internalOptions.buttonClass !== undefined)
                buttonClass = internalOptions.buttonClass;

            initializeButtons();
            //debugger
            editBtn.initializeFromOptions(
                    internalOptions.editButton,
                    buttonClass
                );
            okBtn.initializeFromOptions(
                    internalOptions.okButton,
                    buttonClass
                );
            cancelBtn.initializeFromOptions(
                    internalOptions.cancelButton,
                    buttonClass
                );
            duplicateBtn.initializeFromOptions(
                    internalOptions.duplicateButton,
                    buttonClass
                );
            removeBtn.initializeFromOptions(
                    internalOptions.removeButton,
                    buttonClass
                );
        }

        function initializeButtons() {
            editBtn = new Button("",
                    "editButton",
                    "Edit",
                    true,
                    startEdit,
                    modeEnum.NORMAL);
            okBtn = new Button("",
                    "okButton",
                    "OK",
                    true,
                    acceptEdit,
                    modeEnum.EDIT);
            cancelBtn = new Button("",
                    "cancelButton",
                    "Cancel",
                    true,
                    cancelEdit,
                    modeEnum.EDIT);
            duplicateBtn = new Button("",
                    "duplicateButton",
                    "Duplicate",
                    false,
                    duplicateEditable,
                    modeEnum.NORMAL);
            removeBtn = new Button("",
                    "removeButton",
                    "Remove",
                    false,
                    removeEditable,
                    modeEnum.NORMAL);
        }

        var startEdit = function (e) {
            var $parent = $(this).parent();
            var $editableSpan = $parent.find("." + EDITABLE_SPAN_CLS);

			if (internalOptions.onStartEdit !== undefined) {
				internalOptions.onStartEdit(e, $parent, $editableSpan.html());
			}            

            if (!e.isPropagationStopped()) {    
                var $cancelBtn = cancelBtn.create();
                $cancelBtn.insertAfter($editableSpan);

                okBtn.create().insertAfter($editableSpan);
               
                var $input = $("<input type = 'text'/>")
						.attr("class", $parent.attr("class"))
						.addClass(TEXT_INPUT_CLS + " "
                                + EDIT_MODE_CLS + " "
                                + textInputStyleCls)
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

        var removeEditable = function () {
        };

        var duplicateEditable = function () {
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

            if (editMode != "button") {
                $span.dblclick(startEdit);
            } else {
                $span.css("cursor","default");
            }

            return $span;
        }

        function editableToNormalMode($editable, spanHtml) {

            $editable.empty()
                    .append(createSpan($editable, spanHtml))
            		.append(editBtn.create())
                    .append(removeBtn.create())
                    .append(duplicateBtn.create())
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