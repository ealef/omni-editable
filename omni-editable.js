(function ($, console) {

    $.fn.omniEditable = function (options) {

        // private variables
        var EDIT_BTN_CLS = "cancelButton";
        var OK_BTN_CLS = "okButton";
        var CANCEL_BTN_CLS = "cancelButton";
        var EDITABLE_SPAN_CLS = "editableSpan";
        var TEXT_INPUT_CLS = "textInput";
        var EDIT_MODE_CLS = "editMode";
        var NORMAL_MODE_CLS = "normalMode";
        // ...

        // support multiple elements
        if (this.length > 1) {
            this.each(function () { $(this).omniEditable(options) });
            return this;
        }

        


        // private methods
        var startEdit = function (e) {
            var parent = $(this).parent();
            var editableSpan = parent.find("." + EDITABLE_SPAN_CLS);

            if (options.onStartEdit !== undefined) {
                options.onStartEdit(e, parent, editableSpan.html());
            }

            if (!e.isPropagationStopped()) {
                var cancelButton = $("<button>Cancel</button>")
						.text("Cancel")
						.attr("type", "button")
						.click(cancelEdit)
						.addClass(CANCEL_BTN_CLS + " " + EDIT_MODE_CLS)
						.insertAfter(editableSpan);
                var okButton = $("<button></button>")
						.text("OK")
						.attr("type", "button")
						.addClass(OK_BTN_CLS + " " + EDIT_MODE_CLS)
						.click(acceptEdit)
						.insertAfter(editableSpan);
                var input = $("<input type = 'text'/>")
						.attr("class", parent.attr("class"))
						.addClass(TEXT_INPUT_CLS + " " + EDIT_MODE_CLS)
						.val(editableSpan.text())
						.prop("defaultValue", editableSpan.text())
						.keyup(checkShortcuts)
						.insertBefore(editableSpan)
						.focus();

                parent.find("." + NORMAL_MODE_CLS)
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

        function exitEditMode(e, clickedButton, keepChanges) {
            var parent = clickedButton.parent();
            var optionEvent = keepChanges ?
					options.onAcceptEdit :
					options.onCancelEdit;

            if (optionEvent !== undefined) {
                var input = parent.find("." + TEXT_INPUT_CLS);

                optionEvent(
					e,
					parent,
					input.val(),
					input.prop("defaultValue")
				);
            }

            if (!e.isPropagationStopped()) {
                revertEdit(parent, keepChanges);
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
            var parent = $(this).parent();

            switch (code) {
                case 13:	// ENTER
                    acceptEdit.call(parent.find("." + OK_BTN_CLS));
                    break;
                case 27:	// ESC
                    cancelEdit.call(parent.find("." + CANCEL_BTN_CLS));
                    break;
            }
        }

        function revertEdit(editable, keepChanges) {
            var spanHtml = keepChanges ?
					editable.find("." + TEXT_INPUT_CLS).val() :
					editable.find("." + TEXT_INPUT_CLS).prop("defaultValue");

            editable.append(createSpan(editable, spanHtml))
					.append(createEditButton(editable))
					.find("." + EDIT_MODE_CLS)
					.remove();
        }

        function createSpan(editable, html) {
            return $("<span></span>")
					.html(html)
					.addClass([
						editable.attr("class"),
						EDITABLE_SPAN_CLS,
						NORMAL_MODE_CLS
					].join(" "));
        }

        function createEditButton(editable) {
            return $("<button></button>")
					.text("Edit")
					.attr("type", "button")
					.addClass(EDIT_BTN_CLS + " " + NORMAL_MODE_CLS)
					.click(startEdit);
        }
        // ...

        // public methods        
        this.initialize = function () {
            // do something ...
            return this;
        };

        this.bar = function () {
            // do something ...
        };
        return this.initialize();

        this.each(function () {
            var editable = $(this);

            var editableHtml = editable.html();
            editable.empty()
					.append(createSpan(editable, editableHtml))
					.append(createEditButton(editable));
        });
    }
}(jQuery, true ? { log: function() { } } : console ));