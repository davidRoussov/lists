import { Template } from 'meteor/templating';

import './main.html';


Template.menu.helpers({
  topic: function() {
  	return getMenuTopics();
  },
});

Template.menu.events({
	"click .menu-button":function(event) {
		var docid = $(event.target).attr("id");
		showList(docid);
	},
	"click .js-add-new-topic":function(event) {
		createNewTopic();
	}
});

Template.content.events({
	"click .js-list-element":function(event) {
		var doesContentExist = $(event.target).next().next();
		if (doesContentExist.is(":visible")) {
			$(event.target).next().next().hide();
		} else {
			$(event.target).next().next().show();
		}
	},
	"change .js-list-element":function(event) {
		var newTitle = $(event.target).val();
		var docid = $(event.target).parent().parent().attr("id");
		var order = $(event.target).parent().attr("id");
		updateListElement(docid, newTitle, order, true);
	},
	"change .js-list-element-content":function(event) {
		var newContent = $(event.target).val();
		var docid = $(event.target).parent().parent().parent().attr("id");
		var order = $(event.target).parent().parent().attr("id");
		updateListElement(docid, newContent, order, false);
	},
	"change .js-topic-name":function(event) {
		var newTopicName = $(event.target).val();
		var docid = $(event.target).parent().attr("id");
		updateTopicName(docid, newTopicName);
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
	"click .js-delete-topic":function(event) {
		
		var docid;

		var nodeName = $(event.target).prop("nodeName");
		if (nodeName === "BUTTON") {
			docid = $(event.target).parent().attr("id");
		} else {
			docid = $(event.target).parent().parent().attr("id");
		}

		deleteTopic(docid);

		$(".content #"+docid).remove();
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