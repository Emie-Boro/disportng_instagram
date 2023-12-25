function submitForm() {
    const formData = {
        name: document.getElementById('storyName').value,
        state: document.getElementById('storyState').value,
        phone: document.getElementById('storyPhone').value,
        email: document.getElementById('storyEmail').value,
        title: document.getElementById('storyTitle').value,
        content: document.getElementById('storyContent').value,
    };

    fetch('/story/share', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Story Shared successfully')
        document.getElementById('storyForm').reset()
        console.log('Server response:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });

    
}