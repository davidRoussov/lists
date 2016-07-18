import { Meteor } from "meteor/meteor";




getMenuTopics = function() {

	var allDocs = ListData.find({"owner": Meteor.userId()}).fetch();
	allDocs.forEach(function(doc) {
		if (doc["topicName"].length < 1)
			doc["topicName"] = "[Empty topic name]";
	});	
	return allDocs;
}

showList = function(docid) {

	var cursor = ListData.find({"_id": docid});
	var topicName,list;
	cursor.forEach(function(doc) {
		topicName = doc["topicName"];
		list = doc["list"];
	});

	var html = Meteor.htmlForJs.generateList(docid, topicName, list);
	$(".content").append(html);
}

updateListElement = function(docid, newText, order, updateTitle, callback) {

	var newDoc = {};
	var cursor = ListData.find({"_id":docid});
	cursor.forEach(function(doc) {
		newDoc["_id"] = doc["_id"];
		newDoc["topicName"] = doc["topicName"];
		newDoc["owner"] = doc["owner"];
		newDoc["userName"] = doc["userName"];
		var newList = [];
		var i;
		for (i = 0; i < doc["list"].length; i++) {

			if (doc["list"][i]["order"] === Number(order)) {

				if (updateTitle) {
					newList.push(
						{
							order: doc["list"][i]["order"],
							title: newText,
							content: doc["list"][i]["content"]
						}
					);
				} else {
					newList.push(
						{
							order: doc["list"][i]["order"],
							title: doc["list"][i]["title"],
							content: newText
						}
					);
				}


			} else {
				newList.push(
					{
						order: doc["list"][i]["order"],
						title: doc["list"][i]["title"],
						content: doc["list"][i]["content"]
					}
				);
			}
		}
		newDoc["list"] = newList;
	});

	ListData.update({"_id": docid}, newDoc);

	callback();
}

updateTopicName = function(docid, newTopicName, callback) {
	ListData.update(
		{_id: docid},
		{$set:
			{
				topicName: newTopicName
			}
		}
	);

	callback();
}	

createEmptyElement = function(docid, newOrder) {
	var newDoc = {};
	newDoc["_id"] = docid;

	var doc = ListData.find({"_id": docid}).fetch();
	doc.forEach(function(element) {
		newDoc["topicName"] = element["topicName"];

		element["list"].push({"order": newOrder, "title": "", "content": ""});

		newDoc["list"] = element["list"];

		newDoc["owner"] = element["owner"];

		newDoc["userName"] = element["userName"];
	});
	
	ListData.update({"_id": docid}, newDoc);
}

// sorting elements of form {order: x, title: y, content: z} so that small x is first
compare = function(a,b) {
	if (Number(a["order"]) < Number(b["order"])) {
		return -1;
	}
	else if (Number(a["order"]) > Number(b["order"])) {
		return 1;
	}
	return 0;
}

createNewTopic = function() {
	ListData.insert({
		"topicName": "",
	    "list": [],
	    "owner": Meteor.userId(),
	    "userName": Meteor.user().username
	});
}

deleteTopic = function(docid) {
	ListData.remove({"_id": docid});
}

deleteListElement = function(docid, order) {
	var newDoc = {};
	newDoc["_id"] = docid;

	var doc = ListData.find({"_id": docid}).fetch();
	doc.forEach(function(element) {
		newDoc["topicName"] = element["topicName"];
		newDoc["owner"] = element["owner"];
		newDoc["userName"] = element["userName"];

		var i;
		for (i = 0; i < element["list"].length; i++) {
			if (element["list"][i]["order"] == Number(order))
				element["list"].splice(i,1);
		}

		newDoc["list"] = element["list"];
	});

	ListData.update({"_id": docid}, newDoc);
}

showHideContent = function(event) {
	var doesContentExist = $(event.target).next().next();
	if (doesContentExist.is(":visible")) {
		$(event.target).next().next().hide();
	} else {
		$(event.target).next().next().show();

		// setting the height of the content textarea to the height of the text inside
		var newHeight = $(event.target).next().next().children().first().get(0).scrollHeight + 10;
		$(event.target).next().next().children().first().css("height", newHeight);
	}
}