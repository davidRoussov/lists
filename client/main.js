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
	  	topicNames = listData.map(function(a) {
	  		if (a.topicName != "")
	  			return {"topicName": a.topicName, "_id": a._id};
	  		else
	  			return {"topicName": "[topic name]", "_id": a._id};
	  	});
	  	return topicNames;
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
		Meteor.call("createNewTopic");
	}
});

Template.content.events({
	"click .js-list-element":function(event) {
		
		if (!is.mobile()) return; // click to open textarea on mobile, dbclick to open on windows

		var contentAreaElement = $(event.target).next();
		if (contentAreaElement.is(":visible")) {
			contentAreaElement.hide();
		} else {
			contentAreaElement.show();
			contentAreaElement.height(contentAreaElement[0].scrollHeight);
		}

	},
	"dblclick .js-list-element":function(event) {
		
		if (is.mobile()) return; // don't know if necessary, but I don't want this function to run on mobile since click will be used

		var contentAreaElement = $(event.target).next();
		if (contentAreaElement.is(":visible")) {
			contentAreaElement.hide();

			window.getSelection().removeAllRanges(); // unhighlight input when closing textarea - just aesthetics - I probably won't be likely to be changing the inputs when I usually finish viewing the textareas
		} else {
			contentAreaElement.show();
			contentAreaElement.height(contentAreaElement[0].scrollHeight);

			contentAreaElement.focus(); //so that input isn't highlighted and user can begin typing in textarea straight away
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
	"click .js-enable-element-deletion":function(event) {
		var oneTopicDiv = $(event.currentTarget).parent().parent();

		if (Session.get("deleteElementMode")) {
			oneTopicDiv.find(".js-check-element-box").css("display", "inline");

			oneTopicDiv.find(".js-delete-list-element").css("display", "none");

			$(event.currentTarget).css("text-decoration", "none");

			Session.set("deleteElementMode", false);
		} else {
			oneTopicDiv.find(".js-check-element-box").css("display", "none");

			oneTopicDiv.find(".js-delete-list-element").css("display", "inline");

			$(event.currentTarget).css("text-decoration", "underline");

			Session.set("deleteElementMode", true);
		}
	},
	"click .js-delete-list-element":function(event) {
		var button = $(event.currentTarget);
		var elementRank = button.parent().parent().attr('id');
		var topicID = button.parent().parent().parent().parent().attr('id');

		Meteor.call("deleteListElement", topicID, elementRank);
	},
	"click .js-check-element-box":function(event) {
		var checkbox = $(event.target);

		var checked;
		if (checkbox.is(":checked")) {checked = true;} else {checked = false;}

		var elementRank = checkbox.parent().parent().attr('id');
		var topicID = checkbox.parent().parent().parent().parent().attr('id');

		Meteor.call("setElementChecked", topicID, elementRank, checked, function() {
			if (checked) {
				checkbox.parent().next().children().first().css("text-decoration", "line-through");
			} else {
				checkbox.parent().next().children().first().css("text-decoration", "none");
			}
		});
	},
	"click .js-refresh-checked-elements":function(event) {
		var button = $(event.target);
		var topicID = button.parent().parent().attr("id");

		Meteor.call("refreshCheckedElements", topicID);
	},
	//button under topic name that hides all open content areas for the given topic
	"click .js-hide-all-elements-content":function(event) {
		var button = $(event.target);
		var topicID = button.parent().parent().attr("id");

		$(".content " + "#" + topicID + " .js-list-element-content").each(function() {
			$(this).hide();
		});
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