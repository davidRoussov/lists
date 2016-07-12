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
		//createNewTopic();




		
		var newDoc = {};
		var cursor = ListData.find();
		cursor.forEach(function(doc) {
			newDoc["_id"] = doc["_id"];
			newDoc["topicName"] = doc["topicName"];
			newDoc["list"] = doc["list"];
			newDoc["owner"] = Meteor.userId();
			newDoc["userName"] = Meteor.user().username;
			ListData.update({"_id": doc["_id"]}, newDoc);
		});







	}
});

Template.menu.events({
	"click .menu-button":function(event) {
		var docid = $(event.target).attr("id");
		showList(docid);
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
		var doesContentExist = $(event.target).next().next();
		if (doesContentExist.is(":visible")) {
			$(event.target).next().next().hide();
		} else {
			$(event.target).next().next().show();

			// setting the height of the content textarea to the height of the text inside
			var newHeight = $(event.target).next().next().children().first().get(0).scrollHeight + 10;
			$(event.target).next().next().children().first().css("height", newHeight);
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
		
		incrementOrder(docid); // elements are added at the top; +1 to all the elements current existing


		//*******************************
		// the html ids are not incremented
		//***************************

		createEmptyElement(docid);

		
		var html = Meteor.htmlForJs.singleListElement(1, "", "");
		
		// if we update db with new element then we do not need to have this code - reactivity!
		var nodeName = $(event.target).prop("nodeName");
		if (nodeName === "BUTTON") {
			$(event.target).parent().after(html);
		} else {
			$(event.target).parent().parent().after(html);
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
	}
});