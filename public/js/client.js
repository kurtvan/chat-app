// client side code for messaging app
// controls listing messages and emitting outgoing
// ones to the socket


// ----------------------------------------------------------------------------
// Global Variables
// ----------------------------------------------------------------------------

var socket = io();
var user = null;
var convo = null;
var menuShowing = false;

// package login information and emit event to the server
var logIn = function() {
	socket.emit('login-attempt', [$('#username').val(), $('#password').val()]);
	$('#password').val('');
	return false; // prevents the html form from auto submitting
}

// package sign up information and send emit event to the server
var signUp = function() {
	socket.emit('signup-attempt', [$('#username').val(), $('#password').val()]);
	$('#password').val('');
	return false; // prevents the html form from auto submitting
}

// focus on the username field upon loading page
$(document).ready(function() {
	$('#login-alert').hide();
	$('#username').focus();
	$('#m').val('');

	// calculate height of the messages window based on the header and
	// messsage bar heights
	var messagesWindowHeight = $(window).height() - $('#message-enter').height() - $('#messaging-topbar').height();
	$('#messages').css("height", messagesWindowHeight.toString() + "px");
	$('#convo-list').css("height", messagesWindowHeight.toString() + "px");

	// similar calculation for the slide out menu's height
	var mainMenuHeight = $(window).height() - $('#message-enter').height();
	$('#main-menu').css("height", mainMenuHeight.toString() + "px");
})


// ----------------------------------------------------------------------------
// Event Handlers for clicking and UI
// ----------------------------------------------------------------------------

// when the user clicks the login button
$('#signin').click(function() {
	logIn();
});

// when the user clicks the sign up button
$('#signup').click(function() {
	signUp();
});

// when message is sent, emit to all sockets
$('#message-enter').submit(function() {
	socket.emit('chat-message', [$('#m').val(), user, convo]);
	$('#m').val('');
	return false;
});

$('#logout').click(function() {
	socket.emit('logout', user);
	$('#login-form').css('background-color', 'white');

	$('#curtain').fadeIn(200, function() {
		$('#main-app').hide();
		$('#username').focus();
	});

	//  animation for login transition
	$('#login-page').animate({
			top: '50%'
		}, 800);
	// set the clients user
	user = null;
	$('#loggedin').text('');

});


$("#show-convos").click(function() {

	if (!menuShowing) {

		menuShowing = true;

		$("#main-menu").animate({
			left: '0px'
		}, 200);
	}
	else {

		menuShowing = false;

		$("#main-menu").animate({
			left: ($("#main-menu").width() * -1).toString() + 'px'
		}, 200);
	}
});


// ----------------------------------------------------------------------------
// Event Handlers for events sent from the server
// ----------------------------------------------------------------------------


// when message is recieved, add to <ul>
socket.on('chat-message', function(msg) {
	var msgHolder = $('<li class=message-holder></li>');
	var newMsg = $('<p class=message>' + msg["msg"] + '</p>')
	// var newMsg = $('<li class=message>' + msg["msg"] + '</li>');
	if (msg["user"] == user) {
		newMsg.addClass("self");
	}

	msgHolder.append(newMsg);
	// $('#messages').append('<li class=message>' + msg["msg"] + '</li>');
	$('#messages').append(msgHolder);

	var last_li = $("#messages li:last-child").offset().top;

	// $("#messages").animate({
  //   scrollTop: $("#messages li").last().offset().top
  // }, 200);

	$("#messages").animate({ scrollTop: $("#messages")[0].scrollHeight}, 200);

});

socket.on('login-success', function(loginUser) {
	// transition from login page to chat page
	$('#username').val('');
	$('#login-alert').hide(200);
	$('#login-form').css('background-color', '#BFFFBD'); // green for success
	$('form p').css('color', 'black');
	//  animation for login transition
	$('#login-page').animate({
			top: '200%'
		}, 800, function() {
			$('#main-app').show();
			$('#m').focus();
			$('#curtain').fadeOut(200);
	});
	// set the clients user
	user = loginUser[0];
	$('#loggedin').text(user.toUpperCase());

	// populate the convo list for the client
	var convo_list = loginUser[1];
	var users_string;
	var cur_convo;

	// for every conversation
	for (var i = 0; i < convo_list.length; i++) {
		users_string = "";
		cur_convo = convo_list[i];

		// for every user in the conversation, add it to a string
		for (var j = 0; j < cur_convo.members.length; j++) {
			users_string = users_string + cur_convo.members[j];
			if (j < cur_convo.members.length - 1) {
				users_string = users_string + ", ";
			}
		}

		$("#convo-list").append('<li>'+ users_string +'</li>');
		console.log("butts");
	}

});

// when there is a login failure
socket.on('login-failure', function(loginUser) {
	$('#login-alert').text('Invalid login credentials');
	$('#login-alert').show(200);
	$('#login-form').css('background-color', '#ffcccc');
	$('form p').css('color', 'white');
	$('#login-alert').css('color', 'red');
});

socket.on('signup-success', function() {
	$('form p').css('color', '#b9b9c8');
	$('#login-alert').css('color', 'rgb(0, 158, 77)');
	$('#login-form').css('background-color', 'white');
	$('#login-alert').text('account ' + '\'' + $('#username').val() + '\' created');
	$('#login-alert').show(200);
});

$("#username").focus(function() {
	$("#user-validation").hide(200);
});

socket.on('valid-username', function() {
	$("#user-validation").text("valid username");
	$("#user-validation").css("color", 'rgb(0, 158, 77)');
	$('#user-validation').show(200);
});

socket.on('invalid-username', function() {
	$("#user-validation").text("invalid username");
	$("#user-validation").css("color", 'red');
	$('#user-validation').show(200);
});
