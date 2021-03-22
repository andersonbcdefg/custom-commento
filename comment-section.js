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

		}
	</style>
	<p>Submit a comment here! Your name will be attached to your comment, so be civil!</p>
	<textarea id="comment-text"></textarea>
	<button id="submit-comment">Submit</button>`;
	document.querySelector("#submit-comment").addEventListener("click", (e) => {
		e.preventDefault();
		let commentText = document.querySelector("#comment-text").value;
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
			<h3 class="commenter-name">${stripName(x.markdown).replaceAll("\t", "")}</h3>
			<p class="comment-body">${x.markdown.replace(/\t.*\t/, "")}</p>
			<code class="comment-date">${x.creationDate.slice(0, 10)}</code>
			</div>`;
	});
    commentList.innerHTML = `
    <style scoped>
		.commento-comment {
			width: 100%;
			border: 2px solid black;
			border-radius: 10px;
		}
	</style>
	${commentHTML.join("")}`;
});