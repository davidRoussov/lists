import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';	

Meteor.methods({
	createNewElement:function(topicID, newElementRank) {
		var data = ListData.findOne({"owner": Meteor.userId()})["data"];

		for (var i = 0; i < data.length; i++) {
			if (data[i]["_id"] === topicID) {
				data[i]["list"].push({"title": "", "content": "", "rank": newElementRank, "checked": false, "_id": Random.id()});
			}
		}

		createAndUpdate(data);
	},
	updateListElement:function(topicID, newTitle, rank) {
		var data = ListData.findOne({"owner": Meteor.userId()})["data"];

		for (var i = 0; i < data.length; i++) {
			if (data[i]["_id"] === topicID) {
				var list = data[i]["list"];
				for (var j = 0; j < list.length; j++) {
					if (list[j]["rank"] == rank) {
						data[i]["list"][j]["title"] = newTitle;
					}
				}
			}
		}

		var newDoc = createUpdatedDocument(data);
		ListData.update({_id:ListData.findOne({"owner": Meteor.userId()})["_id"]}, newDoc);
	},
	updateListElementRank:function(topicID, elementID, newRank) {
		var data = ListData.findOne({"owner": Meteor.userId()})["data"];

		for (var i = 0; i < data.length; i++) {
			if (data[i]["_id"] === topicID) {
				var list = data[i]["list"];
				for (var j = 0; j < list.length; j++) {
					if (list[j]["_id"] === elementID) {
						data[i]["list"][j]["rank"] = newRank;
					}
				}
			}
		}

		createAndUpdate(data);
	},
	updateTopicRank:function(element, before, after) {
		var data = ListData.findOne({"owner": Meteor.userId()})["data"];
		var newRank, i;

		if (!before) {
			for (i = 0; i < data.length; i++) {
				if (data[i]["_id"] === after) {
					newRank = data[i]["rank"] - 1;
				}
			}
		} else if (!after) {
			for (i = 0; i < data.length; i++) {
				if (data[i]["_id"] === before) {
					newRank = data[i]["rank"] + 1;
				}
			}
		} else if (before && after) {
			var rankBefore, rankAfter;
			for (i = 0; i < data.length; i++) {
				if (data[i]["_id"] === after) {
					rankAfter = data[i]["rank"];
				}
				if (data[i]["_id"] === before) {
					rankBefore = data[i]["rank"];
				}
			}
			newRank = (rankBefore + rankAfter) / 2;
		}

		for (i = 0; i < data.length; i++) {
			if (data[i]["_id"] === element) {
				data[i]["rank"] = newRank;
			}
		}

		createAndUpdate(data);
	},
	createNewTopic:function() {
		var userExistence = ListData.findOne({"owner": Meteor.userId()});

		var highestRank = getHighestRank();

		var topicID = Random.id();

		var json = {"topicName": "", "_id": topicID, "rank": highestRank + 1, list: []};

		if (typeof userExistence != "undefined") {
			var data = ListData.findOne({"owner": Meteor.userId()})["data"];

			data.push(json);

			createAndUpdate(data);
		}
		else {
			var data = [json];

			var newDoc = createUpdatedDocument(data);
			ListData.insert(newDoc);
		}

		return topicID; // this is so the client js finds the topic in the dom to make it visible
	},
	updateTopicName:function(topicID, newTopicName) {
		var data = ListData.findOne({"owner": Meteor.userId()})["data"];

		for (var i = 0; i < data.length; i++) {
			if (data[i]["_id"] === topicID) {
				data[i]["topicName"] = newTopicName;
			}
		}

		createAndUpdate(data);
	},
	deleteTopic:function(topicID) {
		var data = ListData.findOne({"owner": Meteor.userId()})["data"];

		for (var i = 0; i < data.length; i++) {
			if (data[i]["_id"] === topicID) {
				data.splice(i, 1);
			}
		}

		createAndUpdate(data);
	},
	deleteListElement:function(topicID, rank) {
		var data = ListData.findOne({"owner": Meteor.userId()})["data"];

		for (var i = 0; i < data.length; i++) {
			if (data[i]["_id"] === topicID) {
				var list = data[i]["list"];
				for (var j = 0; j < list.length; j++) {
					if (list[j]["rank"] == rank) {
						data[i]["list"].splice(j, 1);
					}
				}
			}
		}

		createAndUpdate(data);
	},
	setElementChecked:function(topicID, rank, checked) {
		var data = ListData.findOne({"owner": Meteor.userId()})["data"];

		for (var i = 0; i < data.length; i++) {
			if (data[i]["_id"] === topicID) {
				var list = data[i]["list"];
				for (var j = 0; j < list.length; j++) {
					if (list[j]["rank"] == rank) {
						data[i]["list"][j]["checked"] = checked;
					}
				}
			}
		}

		createAndUpdate(data);
	},
	refreshCheckedElements:function() {
		var data = ListData.findOne({"owner": Meteor.userId()})["data"];

		for (var i = 0; i < data.length; i++) {
			for (var j = 0; j < data[i]["list"].length; j++) {
				data[i]["list"][j]["checked"] = false;
			}
		}

		createAndUpdate(data);
	},
	updateListElementContent:function(topicID, rank, content) {
		var data = ListData.findOne({"owner": Meteor.userId()})["data"];

		for (var i = 0; i < data.length; i++) {
			if (data[i]["_id"] === topicID) {
				var list = data[i]["list"];
				for (var j = 0; j < list.length; j++) {
					if (list[j]["rank"] == rank) {
						data[i]["list"][j]["content"] = content;
					}
				}
			}
		}

		createAndUpdate(data);
	},


	tempFunc:function() {
		
	},


	/*FUNCTION FOR SEEDING DB WITH SAMPLE DATA - NEEDS TO BE REMOVED*/
	seedDB:function() {
		var listData = 
			{
				"_id": "7whRHJTRDcXKxfD9f",
				"owner": "P8TDSLbCNLiHjTvx8",
				"userName": "david",
				"data": [
					{
						"topicName": "first topic",
						"_id": "vis9A3B9F6bJW43jF",
						"rank": 2,
						"list": [
							{
								"title": "element title",
								"content": "element content",
								"checked": false,
								"rank": 1,
								"_id": "NqMNvQbZxpsNHwHTi"
							},
							{
								"title": "another title",
								"content": "more content",
								"checked": true,
								"rank": 2,
								"_id": "3rWzkyqK7h838iQde"
							}
						]
					},
					{
						"topicName": "second topic",
						"_id": "9n3ywWMA9vcXxnmz4",
						"rank": 1,
						"list": [
							{
								"title": "element title",
								"content": "element content",
								"checked": true,
								"rank": 1,
								"_id": "M5HNY3FHRGmzvqxyZ"
							},
							{
								"title": "another title",
								"content": "more content",
								"checked": false,
								"rank": 2,
								"_id": "ghaHTzjx7knCZGZ3K"
							}
						]
					}
				]
			};

		ListData.insert(listData);
	}
});

function createAndUpdate(data) {
	var newDoc = createUpdatedDocument(data);
	ListData.update({_id:ListData.findOne({"owner": Meteor.userId()})["_id"]}, newDoc);
}

function createUpdatedDocument(data) {
	return {
		"owner": Meteor.userId(),
		"userName": Meteor.user().username,
		"data": data
	};
}

function getHighestRank() {
	var user = ListData.findOne({"owner": Meteor.userId()});
	if (user == null)
		return 0;
	else
		var data = user["data"];

	// if there are no topics, default rank is 0
	if (data.length == 0)
		return 0;

	var maxRank = data[0]["rank"];
	for (var i = 1; i < data.length; i++) {
		if (data[i]["rank"] > maxRank) {
			maxRank = data[i]["rank"];
		}
	}

	return maxRank;
}

