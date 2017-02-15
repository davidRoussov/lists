import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import './main.html';

// demo account:
// username: demo
// password: asdasd

Accounts.ui.config({
	passwordSignupFields: "USERNAME_ONLY",
});

Template.loginButtons.events({
	"click #login-buttons-logout":function(event) {
		$(".one-topic").remove();
	}
});

Template.menu.helpers({
  topic: function() {
  	var user = Meteor.users.findOne({_id: Meteor.userId()});
  	if (user) {
  		var listData = ListData.findOne({"owner": Meteor.userId()})["data"];
	  	listData = listData.sort(compare);

	  	return listData;
  	}
  }
});

Template.content.helpers({
	topic: function() {
		var user = Meteor.users.findOne({_id: Meteor.userId()});
  		if (user) {
			var listData = ListData.findOne({"owner": Meteor.userId()})["data"];
			for (var i = 0; i < listData.length; i++) {
				listData[i]["list"] = listData[i]["list"].sort(compare);
			}
			return listData;
		}
	}
});

Template.inputFields.helpers({
	checkboxMode: function() {
		return Session.get("showCheckboxesMode");
	}
});

Template.body.events({
	// closing dropdown menu if you click anywhere in the main container
	"click .wrapper":function(event) {

		var eventClass = $(event.target).attr("class");

		try {
			if (!eventClass.includes("js-topic-options"))
				$(".dropdown-content").hide();
		} catch(err) {
			$(".dropdown-content").hide();
		}
	}
});

Template.menu.events({
	"click .js-menu-button":function(event) {
		var menuButton = $(event.target);
		var topicid = $(event.target).attr("id");
		var topic = $(".content-panel").find("#"+topicid);
		if (topic.is(":visible")) {
			topic.hide()

			menuButton.css("background-color", ""); // remove button highlight when deselecting topic
		} else {
			topic.appendTo(".content");
			topic.show();

			menuButton.css("background-color", "#E0F7E0"); // highlight menu button green when selecting topic
		}

	},
	"click .js-add-new-topic":function(event) {

		var newTopic = $(".userInputNewTopic").val();
		Meteor.call("createNewTopic", newTopic, function() {
	    	$('.modal').modal('hide');
	    	$('.modal-backdrop').remove();
		});
	}
});

Template.content.events({
	// "click .js-list-element":function(event) {
		
	// 	if (!is.mobile()) return; // click to open textarea on mobile, dbclick to open on windows

	// 	var contentAreaElement = $(event.target).next();
	// 	if (contentAreaElement.is(":visible")) {
	// 		contentAreaElement.hide();
	// 	} else {
	// 		contentAreaElement.show();
	// 		contentAreaElement.height(contentAreaElement[0].scrollHeight);
	// 	}

	// },
	// "dblclick .js-list-element":function(event) {
		
	// 	if (is.mobile()) return; // don't know if necessary, but I don't want this function to run on mobile since click will be used

	// 	var contentAreaElement = $(event.target).next();
	// 	if (contentAreaElement.is(":visible")) {
	// 		contentAreaElement.hide();

	// 		window.getSelection().removeAllRanges(); // unhighlight input when closing textarea - just aesthetics - I probably won't be likely to be changing the inputs when I usually finish viewing the textareas
	// 	} else {
	// 		contentAreaElement.show();
	// 		contentAreaElement.height(contentAreaElement[0].scrollHeight);

	// 		contentAreaElement.focus(); //so that input isn't highlighted and user can begin typing in textarea straight away
	// 	}

	// },

	"click .js-expand-element-button":function(event) {

		var button = $(event.currentTarget);
		var textarea = button.parent().next().children().eq(1);

		button.children().first().toggleClass("glyphicon-menu-down");
		button.children().first().toggleClass("glyphicon-menu-up");

		if (textarea.is(":visible")) {
			textarea.hide();
		} else {
			textarea.show();
			textarea.height(textarea[0].scrollHeight);
		}
	},
	
	"keyup .js-list-element":function(event) {
		// show or hide content area when you press enter
		if (event.which === 13) {
			var contentAreaElement = $(event.target).next();
			if (contentAreaElement.is(":visible")) {
				contentAreaElement.hide();
			} else {
				contentAreaElement.show();
			}
		}
		// this is if the user presses down arrow where the focus will be brought to the textarea or  the next element 
		else if (event.which === 40) { 
			var textArea = $(event.target).next();
			if (textArea.is(":visible")) {
				textArea.focus();
			} else {
				textArea.parent().parent().next().children().eq(1).children().first().focus();
			}
		} 	
		// the same as above but for up arrow
		else if (event.which === 38) {
			var textArea = $(event.target).parent().parent().prev().children().eq(1).children().eq(1);
			if (textArea.is(":visible")) {
				textArea.focus();
			} else {
				$(event.target).parent().parent().prev().children().eq(1).children().first().focus();
			}
		}
	},
	"keyup .js-list-element-content":function(event) {
		if (event.which === 40) { 
			$(event.target).parent().parent().next().children().eq(1).children().first().focus();
		} 	
		else if (event.which === 38) {
			$(event.target).prev().focus();
		}		

		// automatically resize textarea to fit content
		var textarea = $(event.target);
		textarea.height(textarea[0].scrollHeight - 10);
	},
	"change .js-list-element":function(event) {
		var inputField = $(event.target);
		var newTitle = inputField.val();
		var elementRank = inputField.parent().parent().attr("id");
		var topicID = inputField.parent().parent().parent().parent().attr("id");

		Meteor.call("updateListElement", topicID, newTitle, elementRank, function() {
			inputField.css("color", "black");
		});
	},
	"input .js-list-element":function(event) {
		$(event.target).css("color", "red");
	},
	"change .js-list-element-content":function(event) {
		var inputField = $(event.target);
		var newContent = inputField.val();
		var elementRank = inputField.parent().parent().attr("id");
		var topicID = inputField.parent().parent().parent().parent().attr("id");

		Meteor.call("updateListElementContent", topicID, elementRank, newContent, function() {
			inputField.css("color", "black");
		});
	},
	"change .js-topic-name":function(event) {
		var inputField = $(event.target);
		var topicID = inputField.parent().attr("id");
		var newTopicName = inputField.val();

		Meteor.call("updateTopicName", topicID, newTopicName, function() {
			inputField.css("color", "black");
		}); 
	},
	"input .js-topic-name":function(event) {
		$(event.target).css("color", "red");
	},
	"input .js-list-element-content":function(event) {
		$(event.target).css("color", "red"); // to indicate unsaved changes to the content
	},
	"click .js-add-element":function(event) {
		var button = $(event.currentTarget);

		button.prop("disabled", true); // this is because database and reactivity can't keep up if user clicks add element button quickly

		var docid = button.parent().parent().attr("id");
		
		// if there is no next element, then this is the first one to be of rank 1
		var newElementRank = button.parent().next().children().first().attr("id") - 1;
		if (isNaN(newElementRank))
			newElementRank = 1; 

		Meteor.call("createNewElement", docid, newElementRank, function() {
			button.prop("disabled", false);
		});
	},
	"click .js-delete-topic":function(event) {
		$(event.target).confirmation(
			{
				onConfirm: function() {
					var topicID = $(event.target).parent().parent().attr("id");
					Meteor.call("deleteTopic", topicID);					
				}
			}
		).confirmation("toggle");
	},
	"click .js-delete-list-element":function(event) {
		var button = $(event.currentTarget);
		var elementRank = button.parent().parent().attr('id');
		var topicID = button.parent().parent().parent().parent().attr('id');

		Meteor.call("deleteListElement", topicID, elementRank);
	},
	"click .js-check-element-box":function(event) {
		var checkbox = $(event.target);
		var checked = checkbox.is(":checked");
		var elementRank = checkbox.parent().parent().attr('id');
		var topicID = checkbox.parent().parent().parent().parent().attr('id');

		Meteor.call("setElementChecked", topicID, elementRank, checked);
	},
	"click .js-refresh-checked-elements":function(event) {
		var button = $(event.target);
		var topicID = button.parent().parent().attr("id");

		Meteor.call("refreshCheckedElements", topicID);
	},
	//button under topic name that hides all open content areas for the given topic
	"click .js-hide-all-elements-content":function(event) {
		var button = $(event.currentTarget);
		var div = button.parent().parent();

		div.find(".js-list-element-content").hide();
		div.find(".glyphicon-menu-up").toggleClass("glyphicon-menu-down");
		div.find(".glyphicon-menu-up").toggleClass("glyphicon-menu-up");
	},

	"click .js-enable-element-deletion":function(event) {
		var button = $(event.currentTarget);
		var div = button.parent().parent();

		if (Session.get("deleteElementMode")) {

			div.find(".js-delete-list-element").css("display", "none");

			button.css("text-decoration", "none");

			Session.set("deleteElementMode", false);
		} else {

			disableAllModes(div);

			div.find(".js-delete-list-element").css("display", "inline");

			button.css("text-decoration", "underline");

			Session.set("deleteElementMode", true);
		}
	},

	"click .js-color-elements":function(event) {
		var button = $(event.currentTarget);
		var oneTopicDiv = button.parent().parent();

		if (Session.get("changeColorMode")) {

			oneTopicDiv.find(".js-change-element-color").css("display", "none");

			button.css("text-decoration", "none");

			Session.set("changeColorMode", false);
		} else {

			disableAllModes(oneTopicDiv);

			oneTopicDiv.find(".js-change-element-color").css("display", "inline");

			button.css("text-decoration", "underline");

			Session.set("changeColorMode", true);

		}
	},

	"click .js-show-checkboxes":function(event) {
		var button = $(event.currentTarget);
		var div = button.parent().parent();

		if (Session.get("showCheckboxesMode")) {

			div.find(".js-check-element-box").css("display", "none");

			button.css("text-decoration", "none");

			Session.set("showCheckboxesMode", false);
		} else {
			disableAllModes(div);

			div.find(".js-check-element-box").css("display", "inline");

			button.css("text-decoration", "underline");

			Session.set("showCheckboxesMode", true);
		}

	},

	"click .js-change-element-color":function(event) {
		console.log("hi");
	}

});

Template.inputFields.rendered = function() {
	
	// jquery sortable list elements
	this.$('.element-input-fields-container').sortable({
		stop: function(e, ui) {

			var topicID = $(ui.item.get(0)).parent().parent().attr("id");
			var el = ui.item.get(0);
			before = ui.item.prev().get(0);
			after = ui.item.next().get(0);

			if (!before) {
				newRank = Blaze.getData(after).rank - 1;
			} else if (!after) {
				newRank = Blaze.getData(before).rank + 1;
			} else if (before && after) {
	        	newRank = (Blaze.getData(after).rank + Blaze.getData(before).rank)/2;				
			}
			
			if (newRank) {
				Meteor.call("updateListElementRank", topicID, Blaze.getData(el)._id, newRank);
			}
		}
	});

};

Template.menu.rendered = function() {
	this.$('.topic-buttons').sortable({
		handle: 'button',
		cancel: '',
		stop: function(e, ui) {

			var elementID = $(ui.item.get(0)).children().first().attr("id");
			var beforeID = $(ui.item.prev().get(0)).children().first().attr("id");
			var afterID = $(ui.item.next().get(0)).children().first().attr("id");

			Meteor.call("updateTopicRank", elementID, beforeID, afterID);
		}
	});
};

function compare(a,b) {
	if (a.rank < b.rank)
		return -1;
	if (a.rank > b.rank)
		return 1;
	return 0;
}

function disableAllModes(div) {
	div.find(".js-check-element-box").css("display", "none");
	div.find(".js-delete-list-element").css("display", "none");
	div.find(".js-change-element-color").css("display", "none");

	div.find(".js-enable-element-deletion").css("text-decoration", "none");
	div.find(".js-color-elements").css("text-decoration", "none");
	div.find(".js-show-checkboxes").css("text-decoration", "none");
}