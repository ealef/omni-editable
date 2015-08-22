(function( $ ) {
	$.fn.omniEditable = function() {
		var EDIT_BTN_CLS = "cancelButton";
		var OK_BTN_CLS = "okButton";
		var CANCEL_BTN_CLS = "cancelButton";
		var EDITABLE_SPAN_CLS = "editableSpan";
		var TEXT_INPUT_CLS = "textInput";
		var EDIT_MODE_CLS = "editMode";
		var NORMAL_MODE_CLS = "normalMode";
		
		var startEdit = function() {
			var clickedButton = $(this);
			var parent = clickedButton.parent();
			var editableSpan = parent.find("." + EDITABLE_SPAN_CLS);
			var input = $("<input type = 'text'/>")
					.attr("class", parent.attr("class"))
					.addClass(TEXT_INPUT_CLS + " " + EDIT_MODE_CLS)
					.val(editableSpan.text())
					.prop("defaultValue",editableSpan.text());
			var cancelButton = $("<button>Cancel</button>")
					.text("Cancel")
					.attr("type","button")
					.click(cancelEdit)
					.addClass(CANCEL_BTN_CLS + " " + EDIT_MODE_CLS)
					.insertAfter(editableSpan);
			var okButton = $("<button></button>")
					.text("OK")
					.attr("type","button")
					.addClass(OK_BTN_CLS + " " + EDIT_MODE_CLS)
					.click(acceptEdit)
					.insertAfter(editableSpan);
			
			parent.prepend(input)
					.find("." + NORMAL_MODE_CLS)
					.remove();			
		};
		
		var acceptEdit = function() {
			var clickedButton = $(this);
			var parent = clickedButton.parent();
			revertEdit(parent,true);
		};
		
		var cancelEdit = function() {
			var clickedButton = $(this);
			var parent = clickedButton.parent();
			revertEdit(parent,false);
		};
		
		function revertEdit(editable, keepChanges) {
			var spanHtml = keepChanges?
					editable.find("." + TEXT_INPUT_CLS).val():
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
		
		this.each(function() {
			var editable = $(this);
		
			var editableHtml = editable.html();
			editable.empty()
					.append(createSpan(editable, editableHtml))
					.append(createEditButton(editable));
		});
		
		return this;
	};
}( jQuery ));
