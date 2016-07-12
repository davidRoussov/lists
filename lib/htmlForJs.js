Meteor.htmlForJs = {

	singleListElement: function(order, title, content) {
		
		html = "";

		html += "<div id=\"" + order + "\">";

		html += "<input placeholder=\"enter new title\" type=\"text\" class=\"js-list-element\" value=\"" + title + "\">";

		// button for deleting a list element
		html += "<button type=\"button\" class=\"btn btn-default btn-xs js-delete-list-element\">\
  		<span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span>\
		</button>";

		html += "<div hidden class=\"content-area\">\
		<textarea class=\"js-list-element-content\">" + content + "</textarea>\
		</div>";

		html += "<hr>";

		html += "</div>";



		return html;

	},


	generateList: function(docid, topicName, list, order) {

		// ***********************************
		// need to arrange in order

		// the beginning of the div containing the whole component
		// and the heading which is an input 
		var html = "<div class=\"one-topic\" id=\"" + docid + "\">\
		 <input placeholder=\"enter a topic name\" type=\"text\" class=\"js-topic-name\" value=\"" + topicName + "\"></input>";

		// // button for deleting a whole topic
		// html += "<button type=\"button\" class=\"btn btn-default btn-xs js-delete-topic\">\
  // 		<span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span>\
		// </button>";

		// the add element button for adding new elements
		html += "<div class=\"add-element-container\" id=\"" + docid + "\">";
		html += "\
			<button type=\"button\" class=\"btn btn-default js-add-element\" aria-label=\"Left Align\">\
			  <span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span>\
			  Add element\
			</button>\
		";
		html += "</div>";


		// sorting based on the order if each element
		list.sort(compare);


		var i;
		for (i = 0; i < list.length; i++) {

			html += Meteor.htmlForJs.singleListElement(list[i]["order"], list[i]["title"], list[i]["content"]);

		}


		html += "</div><br>";

		return html;
	}

}