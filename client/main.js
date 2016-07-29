import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

import './main.html';

Accounts.ui.config({
	passwordSignupFields: "USERNAME_ONLY",
});

Template.loginButtons.events({
	"click #login-buttons-logout":function(event) {
		$(".one-topic").next().remove();
		$(".one-topic").remove();
	}
})

Template.menu.helpers({
  topic: function() {
  	return getMenuTopics();
  },
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
})

Template.topBar.events({
	"click .js-add-new-topic":function(event) {
		createNewTopic();
	}
});

Template.menu.events({
	"click .menu-button":function(event) {
		var docid = $(event.target).attr("id");

		//finding if topic is already shown, remove it if it is
		if ($(".content-panel").find("#"+docid).length > 0) {
			$(".content-panel").find("#"+docid).next().remove();
			$(".content-panel").find("#"+docid).remove();
			$(event.target).parent().parent().css("background-color", "#48A28E");
		} else {
			showList(docid);
			$(event.target).parent().parent().css("background-color", "#83E1CC");
		}



	},
	"click .js-topic-options":function(event) {

		var nodeName = $(event.target).prop("nodeName");
		if (nodeName === "BUTTON") {
			$(event.target).next().show();
		} else {
			$(event.target).parent().next().show();
		}
	},
	"click .js-delete-topic":function(event) {
		var topicID = $(event.target).parent().parent().prev().children().first().attr("id");
		deleteTopic(topicID);

		$(".content #"+topicID).next().remove();
		$(".content #"+topicID).remove();
	}
});




Template.content.events({
	"click .js-list-element":function(event) {
		showHideContent(event);
	},
	// show or hide content area when you press enter
	"keypress .js-list-element":function(event) {
		if (event.which === 13) {
			showHideContent(event);
		}
	},
	"change .js-list-element":function(event) {
		var newTitle = $(event.target).val();$(event.target)
		var docid = $(event.target).parent().parent().attr("id");
		var order = $(event.target).parent().attr("id");
		updateListElement(docid, newTitle, order, true, function() {
			$(event.target).removeClass("list-element-changing");
		});
	},
	"keyup .js-list-element":function(event) {
		// unsaved changes result in red highlight of text
		$(event.target).addClass("list-element-changing");
	},
	"change .js-list-element-content":function(event) {
		var newContent = $(event.target).val();
		var docid = $(event.target).parent().parent().parent().attr("id");
		var order = $(event.target).parent().parent().attr("id");
		updateListElement(docid, newContent, order, false, function() {
			$(event.target).removeClass("content-element-change");
		});
	},
	"keyup .js-list-element-content":function(event) {
		// unsaved changes result in red highlight of textarea
		$(event.target).addClass("content-element-change");
	},
	"change .js-topic-name":function(event) {
		var newTopicName = $(event.target).val();
		var docid = $(event.target).parent().attr("id");
		updateTopicName(docid, newTopicName, function() {
			$(event.target).removeClass("list-element-changing");
		});
	},
	"keyup .js-topic-name":function(event) {
		// unsaved changes result in red highlight of text
		$(event.target).addClass("list-element-changing");
	},
	"click .js-add-element":function(event) {
		var docid = $(event.target).parent().parent().attr("id");
		
		var nodeName = $(event.target).prop("nodeName");
		if (nodeName === "BUTTON") {
			var newOrder = $(event.target).parent().next().attr("id") - 1;
			if (isNaN(newOrder))
				newOrder = 1;
			var html = Meteor.htmlForJs.singleListElement(newOrder, "", "");

			$(event.target).parent().after(html);

			createEmptyElement(docid, newOrder);
		} else {
			var newOrder = $(event.target).parent().next().attr("id") - 1;
			if (isNaN(newOrder))
				newOrder = 1;
			var html = Meteor.htmlForJs.singleListElement(newOrder, "", "");

			$(event.target).parent().parent().after(html);

			createEmptyElement(docid, newOrder);
		}
	},
	"click .js-delete-list-element":function(event) {
		var docid, order;

		var nodeName = $(event.target).prop("nodeName");
		if (nodeName === "BUTTON") {
			docid = $(event.target).parent().parent().attr("id");
			order = $(event.target).parent().attr("id");
			$(event.target).parent().remove();
		} else {
			docid = $(event.target).parent().parent().parent().attr("id");
			order = $(event.target).parent().parent().attr("id"); 
			$(event.target).parent().parent().remove();
		}

		deleteListElement(docid, order);		
	},
	"mouseenter .js-delete-list-element":function(event) {
		
		var nodeName = $(event.target).prop("nodeName");
		if (nodeName === "BUTTON") {
			$(event.target).prev().css("background-color", "Tomato");
		} else {
			$(event.target).parent().prev().css("background-color", "Crimson");
		}
	},	
	"mouseleave .js-delete-list-element":function(event) {
		
		var nodeName = $(event.target).prop("nodeName");
		if (nodeName === "BUTTON") {
			$(event.target).prev().css("background-color", "transparent");
		} else {
			$(event.target).parent().prev().css("background-color", "transparent");
		}
	}

});