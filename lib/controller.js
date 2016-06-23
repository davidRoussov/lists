getMenuTopics = function() {

	// var initialData = {
	// 	topicName: "another topic name",

	// 	list: [
	// 		{	
	// 			order: 1,
	// 			title: "element title",
	// 			content: "some content"
	// 		},
	// 		{
	// 			order: 2,
	// 			title: "ergerg",
	// 			content: "45hh4545h"
	// 		}
	// 	]
	// };
	// ListData.insert(initialData);

	var allDocs = ListData.find().fetch();
	allDocs.forEach(function(doc) {
		if (doc["topicName"].length < 1)
			doc["topicName"] = "[Empty topic name]";
	});	
	return allDocs;
	//return ListData.find().fetch();
}

showList = function(docid) {

	//finding if topic is already shown, remove it if it is
	if ($(".content-panel").find("#"+docid).length > 0) {
		$(".content-panel").find("#"+docid).remove();
		return;
	}

	var cursor = ListData.find({"_id": docid});
	var topicName,list;
	cursor.forEach(function(doc) {
		topicName = doc["topicName"];
		list = doc["list"];
	});

	var html = Meteor.htmlForJs.generateList(docid, topicName, list);
	$(".content").append(html);


}

updateListElement = function(docid, newText, order, updateTitle) {

	var newDoc = {};
	var cursor = ListData.find({"_id":docid});
	cursor.forEach(function(doc) {
		newDoc["_id"] = doc["_id"];
		newDoc["topicName"] = doc["topicName"];
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

}

updateTopicName = function(docid, newTopicName) {
	ListData.update(
		{_id: docid},
		{$set:
			{
				topicName: newTopicName
			}
		}
	);
}	

incrementOrder = function(docid) {

	var newDoc = {};
	newDoc["_id"] = docid;

	var doc = ListData.find({"_id": docid}).fetch();
	doc.forEach(function(element) {
		newDoc["topicName"] = element["topicName"];
		var i;
		for (i = 0; i < element["list"].length; i++) {
			element["list"][i]["order"] += 1;
		}
		newDoc["list"] = element["list"];
	});


	ListData.update({"_id": docid}, newDoc);
}

createEmptyElement = function(docid) {
	var newDoc = {};
	newDoc["_id"] = docid;

	var doc = ListData.find({"_id": docid}).fetch();
	doc.forEach(function(element) {
		newDoc["topicName"] = element["topicName"];

		element["list"].push({"order": 1, "title": "", "content": ""});

		newDoc["list"] = element["list"];
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
	ListData.insert({"topicName": "", "list": []});
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

		var i;
		for (i = 0; i < element["list"].length; i++) {
			if (element["list"][i]["order"] == Number(order))
				element["list"].splice(i,1);
		}

		newDoc["list"] = element["list"];
	});

	ListData.update({"_id": docid}, newDoc);
}