


// --------------------------------------share code//////////////////////////////

document.querySelector('.like-btn').onclick = function() {
    alert('You liked this post!');
}

document.querySelector('.comment-btn').onclick = function() {
    let comment = prompt('Enter your comment:');
    if (comment) {
        let commentSection = document.querySelector('.post-comments');
        let newComment = document.createElement('div');
        newComment.classList.add('comment');
        newComment.textContent = comment;
        commentSection.appendChild(newComment);
    }
}

