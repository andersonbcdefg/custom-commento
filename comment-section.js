/* TODO:
	* Logic to disallow comment if the person doesn't have a name and ask them to set their name

*/


const post = (url, data, callback) => {
	var xmlDoc = new XMLHttpRequest();
	xmlDoc.open("POST", url, true);
	xmlDoc.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlDoc.onload = function() {
		callback(xmlDoc.responseText);
	};
	xmlDoc.send(JSON.stringify(data));
};

const stripName = (commentText) => {
	let re = /\t.*\t/g;
	let result = re.exec(commentText);
	if (!result) {
		return "Anonymous";
	} else {
		return result[0];
	}
};

var commentoDataNode = document.querySelector("#comment-data");
var commentoPageId = commentoDataNode.getAttribute("data-page-id");
var commentoMemberName = commentoDataNode.getAttribute("data-member-name");


var commentForm = document.querySelector("#commento-comment-form");
if (commentForm) {
	commentForm.innerHTML = `
	<style scoped>
		textarea {
			width: 90%;
			height: 75px;
		}
		#submit-comment {
	        transition-property: color, border-color;
			transition-duration: .5s;
			transition-timing-function: ease-out;
			background-color: transparent;
	        color: var(--darker-gray-color);
			border-color: var(--darker-gray-color);
	        border-width: 1px;
			border-style: solid;
			z-index: 2;
			width: 125px;
	        padding: 7px 0;
			margin: 25px 5px;
			font-family: -apple-system,Avenir,sans-serif;
	    }
    
	    #submit-comment:hover {
	        color: var(--brand-color);
	        border-color: var(--brand-color);
	        cursor: pointer;
	    }
	</style>
	<p>Submit a comment here! Your name will be attached to your comment, so be civil!</p>
	<textarea id="comment-text"></textarea>
	<br/>
	<button id="submit-comment">Submit</button>
	<p id="comment-box-message"></p>`;
	var messageBox = document.querySelector("#comment-box-message");
	document.querySelector("#submit-comment").addEventListener("click", (e) => {
		e.preventDefault();
		let commentText = document.querySelector("#comment-text").value;
		if (!commentoMemberName || commentoMemberName == "") {
			messageBox.innerHTML = `Whoa there! You need to <a href="#/portal/account/profile">set your name</a> before commenting.`;
			return;
		} else if (commentText == "") {
			messageBox.textContent = `Uh oh! You can't submit an empty comment.`;
			return;
		}
		console.log(commentText);
		let markdown = `\t${commentoMemberName}\t${commentText}`
		let json = {
			"commenterToken": "anonymous",
			"domain": "operationjoker.com",
			"path": commentoPageId,
			"parentHex": "root",
			"markdown": markdown,
		};
		console.log(markdown);
		post("https://comments.operationjoker.com/api/comment/new", json, (res) => {
			console.log(res);
			if (JSON.parse(res)["success"]) {
				messageBox.textContent = "Thanks! Your comment will post after it is approved by a moderator."
			} else {
				messageBox.textContent = "Oops, there was a problem submitting your comment."
			}
			commentForm.reset();
		});

	});
}

var commentList = document.querySelector("#comment-list");
var json = {
	"commenterToken": "anonymous",
	"domain": "operationjoker.com",
	"path": commentoPageId,
};
post("https://comments.operationjoker.com/api/comment/list", json, (res) => {
	let rawComments = JSON.parse(res).comments;
    let commentHTML = rawComments.map(x => {
		return `<div class="commento-comment">
			<div class="comment-top">
			<h3 class="commenter-name">${stripName(x.markdown).replaceAll("\t", "")
				.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</h3>
			<span class="comment-date">${x.creationDate.slice(0, 10)}</span></div>
			<div class="comment-bottom">
			<p class="comment-body">${x.markdown.replace(/\t.*\t/, "")
				.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p></div>
			</div>`;
	});
    commentList.innerHTML = `
    <style scoped>
    	.comment-top {
    		display: flex;
    		align-items: center;
    		justify-content: flex-start;
    		background-color: #dbdbdb;
    		padding: 10px 10px;
    		border-radius: 10px 10px 0 0;
    		border-bottom: 1px solid gray;
    	}

    	.comment-bottom {
    		background-color: #f1f1f1;
    		padding: 10px 10px 20px 10px;
    		border-radius: 0 0 10px 10px;
    	}

		.commento-comment {
			width: 90%;
			margin: 10px 0;
			border: 1px solid grey;
			border-radius: 10px;
			padding: 0;
			color: #282c35
		}

		.commento-comment h3 {
			margin: 0 10px 0 0;
			display: inline-block;
		}

		.commento-comment p {
			margin: 0;
		}

		.comment-date {
			font-size: 0.8rem;
			color: grey;
		}
	</style>
	${commentHTML.join("")}`;
});