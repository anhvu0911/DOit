/* ==========================================================
	CONSTANCE
========================================================== */

// Task types
var READ = 0;
var WATCH = 1;
var PLAY = 2;
var PRACTICE = 3;
var LISTEN = 4;

var tags = [];
var tasks = [];

var data;

/* ==========================================================
	MODEL
========================================================== */
function Tag(_name, _image, _description){
	this.name = _name;
	this.image = _image;
	this.description = _description;
	this.tasks = [];
	
	this.toString = function(){
		return this.name + " (" + this.image + ") " + this.description;
	}
}

function Task(_name, _description, _type, _dueDate, _completeDate, _completed){
	this.name = _name;
	this.description = _description;
	this.type = _type;
	this.dueDate = _dueDate == "" ? null : new Date(_dueDate);
	this.completeDate = _completeDate == "" ? null : new Date(_completeDate);
	this.completed = Boolean(_completed);
	this.parentTaskName = null;
	this.subTasks = [];
	this.tags = [];
	
	this.addSubTask = function(taskName){
		this.subTasks.push(taskName);
		getTask(taskName).parentTaskName = this.name;
	}
	
	this.addTag = function(tagName){
		this.tags.push(tagName);
		getTag(tagName).tasks.push(this.name);
	}
	
	this.getDueDateString = function(){
		return this.dueDate.getFullYear() + "-" + 
			(this.dueDate.getMonth()+1) + "-" +
			this.dueDate.getDate() + " " +
			this.dueDate.getHours() + ":" +
			this.dueDate.getMinutes();
	}
	
	this.getCompleteDateString = function(){
		return this.completeDate.toString();
	}
	
	this.toString = function(){
		var string = this.name + " (" + this.type + ") " + this.description + "\n";
		this.subTasks.forEach(function(subTask){
			string += getTask(subTask).toString();
		});
		return string;
	}
	
	this.isLate = function(){
		var now = new Date();
		return this.dueDate && now > this.dueDate;
	}
	
	// TODO: refactor this
	this.setCompleted = function(completed){
		this.completed = completed;
		
		var parentTask = getTask(this.parentTaskName);
		
		if(completed) {
			$(".task[name='" + this.name + "']").addClass("completed");
			this.completeDate = new Date();
		}else{
			$(".task[name='" + this.name + "']").removeClass("completed");
		}
		
		if(parentTask){
			// Complete parent task if all sub tasks are completed
			parentTask.completed = parentTask.subTasks.every(function(subTaskName){
				return getTask(subTaskName).completed;
			});
			
			if(parentTask.completed){
				$(".task[name='" + parentTask.name + "']").addClass("completed");
			}else{
				$(".task[name='" + parentTask.name + "']").removeClass("completed");
			}
		}else{
			// If this is parent, automatically complete all sub tasks
			this.subTasks.forEach(function(subTaskName){
				getTask(subTaskName).setCompleted(completed);
			});
		}
	}
}

/*function parseTag(tagXML){
	return new Tag(
		tagXML.getElementsByTagName("name")[0].innerHTML,
		tagXML.getElementsByTagName("image")[0].innerHTML,
		tagXML.getElementsByTagName("description")[0].innerHTML
	);
}

function parseTask(taskXML){
	var task = new Task(
		taskXML.getElementsByTagName("name")[0].innerHTML,
		taskXML.getElementsByTagName("description")[0].innerHTML,
		taskXML.getElementsByTagName("type")[0].innerHTML,
		taskXML.getElementsByTagName("due-date")[0].innerHTML,
		taskXML.getElementsByTagName("complete-date")[0].innerHTML,
		taskXML.getElementsByTagName("completed")[0].innerHTML
	);
	
	// Parse sub task
	var subTaskData = taskXML.getElementsByTagName("sub-task");
	for(var i = 0; i < subTaskData.length; i++){
		var subTask = parseTask(subTaskData[i]);
		task.addSubTask(subTask);
		tasks.push(subTask);
	}
	
	// Parse task tag
	var tagData = taskXML.getElementsByTagName("tag");
	for(var i = 0; i < tagData.length; i++){
		task.addTag(tags.filter(function (tag){
			return tag.name == tagData[i].innerHTML;
		})[0]);
	}
	
	return task;
}*/

/* ==========================================================
	MAIN METHOD
========================================================== */

// Save data as JSON
function save(){
	var JSONdata = JSON.stringify({"tags":tags,"tasks":tasks});
	console.log(JSONdata);
}

// Load data from data.xml
function init(){
	var xmlRequest;
	if(window.XMLHttpRequest){
		xmlRequest = new XMLHttpRequest();
	} else {
		xmlRequest = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	/*xmlRequest.open("GET","data.xml",false);
	xmlRequest.send();
	data = xmlRequest.responseXML; 
	
	// Parse tags
	var tagsData = data.getElementsByTagName("tags")[0];
	var tagListData = tagsData.getElementsByTagName("tag");
	for(var i = 0; i < tagListData.length; i++){		
		tags.push(parseTag(tagListData[i]));
	}
	
	// Parse tasks
	var taskData = data.getElementsByTagName("task");
	for(var i = 0; i < taskData.length; i++){
		tasks.push(parseTask(taskData[i]));
	}*/
	
	// Test with JSON
	xmlRequest.open("GET","data.txt",false);
	xmlRequest.send();
	data = JSON.parse(xmlRequest.response); 
	
	data.tags.forEach(function(tag){
		tags.push(new Tag(tag.name, tag.image, tag.description));
	});
	
	data.tasks.forEach(function(task){
		var taskObj = new Task(task.name, task.description, task.type, task.dueDate, task.completeDate, task.completed)
		
		// Parse task tag
		task.tags.forEach(function(tagName){
			taskObj.addTag(tagName);
		});
		
		tasks.push(taskObj);
	});
	
	// Link Subtask
	data.tasks.forEach(function(task){
		task.subTasks.forEach(function(subTaskName){
			getTask(task.name).addSubTask(subTaskName);
		});
	});
	
	console.log(tags);
	console.log(tasks);
	loadTag();
	loadTask();
}

// Find tag by tagname
function getTag(tagName){
	return tags.filter(function (tag,i){
		return tag.name == tagName;
	})[0];
}

// Find tag by tagname
function getTask(taskName){
	return tasks.filter(function (task,i){
		return task.name == taskName;
	})[0];
}

// Load new tags
function loadTag(){	
	var tag_div = $("#tags");
	
	tag_div.empty();
	tags.forEach(function (tag,i){
		tag_div.append("<div class='tag' onclick='loadTask(\"" + tag.name + "\");' name='" + tag.name + "'>" + tag.name + "</div>");
	});
}

// Clear old task list and load new task
function loadTask(tagName){

	$(".tag.selected").removeClass("selected");
	$(".tag[name='" + tagName + "']").addClass("selected");
	
	var tasks_div = $("#tasks");
	tasks_div.empty();
	
	if(tagName != null){
		var tag = getTag(tagName);
		
		tag.tasks.forEach(function (taskName,i){
			var t = getTask(taskName);
			tasks_div.append(getTaskHTML(t));
			
			if(t.subTasks.length != 0){
				var subTask_ul = $(document.createElement('ul'));
				t.subTasks.forEach(function(subTaskName, i){
					var subTask = getTask(subTaskName);
					subTask_ul.append(getTaskHTML(subTask));
				});
				tasks_div.append(subTask_ul);
			}
		});
	
	// Load all tasks
	} else {
		tasks.forEach(function (t,i){
			//Don't load child task, they will be load later
			if(t.parentTaskName){
				return;
			}
			
			tasks_div.append(getTaskHTML(t));
			
			if(t.subTasks.length != 0){
				var subTask_ul = $(document.createElement('ul'));
				t.subTasks.forEach(function(subTaskName, i){
					var subTask = getTask(subTaskName);
					subTask_ul.append(getTaskHTML(subTask));
				});
				tasks_div.append(subTask_ul);
			}
		});
	}
	
	function getTaskHTML(task){
		var taskDiv = $(document.createElement('div'));
		
		var taskCheckbox = $(document.createElement('input'));
		taskCheckbox.attr("type","checkbox");
		taskCheckbox.attr('name',task.name);
		taskCheckbox.attr('onclick',"checkTask('" + task.name + "')");
		if(task.completed){
			taskCheckbox.attr("checked", true);
		} 
		taskDiv.append($(document.createElement('div')).addClass("taskCheckBox").append(taskCheckbox));
		
		var taskHTML = $(document.createElement("div"));
		taskHTML.addClass("task");
		if(task.isLate()){
			taskHTML.addClass("overdue");
		}
		taskHTML.attr("name",task.name);
		var taskHTMLString = task.name + "<br/>";
		if(task.dueDate){
			taskHTMLString += task.getDueDateString() + " | ";
		}
		if(task.parentTaskName){
			getTask(task.parentTaskName).tags.forEach(function(tag){
				taskHTMLString += "<a href='#' onclick='loadTask(\"" + tag + "\");'>" + tag + "</a>&nbsp;";
			});
		} else {
			task.tags.forEach(function(tag){
				taskHTMLString += "<a href='#' onclick='loadTask(\"" + tag + "\");'>" + tag + "</a>&nbsp;";
			});
		}
		taskHTML.html(taskHTMLString);
		if(task.completed){
			taskHTML.addClass("completed");
		}
		taskDiv.append(taskHTML);
		taskDiv.attr("onclick","loadTaskDetail('" + task.name + "')");
		
		return taskDiv;
	}
}

function checkTask(taskName){
	var task = getTask(taskName);
	task.setCompleted($("input[name='" + taskName + "']").prop("checked"));
}

// Display this task Detail
function loadTaskDetail(taskName){

	$(".task.selected").removeClass("selected");
	$(".task[name='" + taskName + "']").addClass("selected");
	
	var task = getTask(taskName);
	
	var task_details = $("#task_details");
	task_details.empty();
	
	task_details.append("<div>" + task.type + "</div>");
	task_details.append("<input type='text' value='" + task.name + "'/></br>");
	task_details.append("<div>" + task.dueDate + "</div></br>");
	task_details.append("<textarea>" + task.description + "</textarea></br>");
}

