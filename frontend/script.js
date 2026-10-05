const API_URL = 'http://localhost:5000/api';

function showTab(sectionId) {
    document.getElementById('signup-section').classList.add('hidden');
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById(sectionId).classList.remove('hidden');
}

// Check login state on load
window.onload = function() {
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('auth-buttons').classList.add('hidden');
        document.getElementById('user-menu').classList.remove('hidden');
        showTab('dashboard-section');
        fetchPosts();
    }
};

async function registerUser() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            alert('Registration successful! Please login.');
            showTab('login-section');
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        alert('Server error during registration');
    }
}

async function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username || 'User');
            alert('Login successful!');
            location.reload();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Server error during login');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    location.reload();
}

async function fetchPosts() {
    try {
        const res = await fetch(`${API_URL}/posts`);
        const posts = await res.json();
        const container = document.getElementById('posts-container');
        container.innerHTML = '';

        if (posts.length === 0) {
            container.innerHTML = '<p>No posts available yet.</p>';
            return;
        }

        posts.forEach(post => {
            let commentsHtml = '';
            if (post.comments && post.comments.length > 0) {
                post.comments.forEach(c => {
                    commentsHtml += `<div class="comment"><b>${c.user || 'Anonymous'}:</b> ${c.text}</div>`;
                });
            } else {
                commentsHtml = '<p style="font-size: 13px; color: #777;">No comments yet.</p>';
            }

            container.innerHTML += `
                <div class="post">
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                    <small style="color: gray;">Posted by: ${post.author || 'Admin'}</small>
                    <hr style="margin: 10px 0;">
                    <h4>Comments</h4>
                    <div>${commentsHtml}</div>
                    <input type="text" id="comment-input-${post._id}" placeholder="Write a comment..." style="margin-top: 5px;">
                    <button onclick="addComment('${post._id}')" style="background: #28a745; padding: 6px;">Add Comment</button>
                </div>
            `;
        });
    } catch (err) {
        console.error(err);
        document.getElementById('posts-container').innerHTML = '<p>Failed to load posts.</p>';
    }
}

async function createPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const token = localStorage.getItem('token');

    if (!title || !content) {
        alert('Please fill in both title and content');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });

        if (res.ok) {
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            fetchPosts();
        } else {
            alert('Failed to create post');
        }
    } catch (err) {
        console.error(err);
    }
}

async function addComment(postId) {
    const textInput = document.getElementById(`comment-input-${postId}`);
    const text = textInput.value;
    const token = localStorage.getItem('token');

    if (!text) {
        alert('Comment cannot be empty');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });

        if (res.ok) {
            textInput.value = '';
            fetchPosts();
        } else {
            alert('Failed to add comment');
        }
    } catch (err) {
        console.error(err);
    }
}