document.getElementById('uploadForm').addEventListener('submit', function(event) {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
      event.preventDefault();  
      fileInput.classList.add('is-invalid');
    } else {
      fileInput.classList.remove('is-invalid');
      alert('Los archivos se han subido correctamente.');
    }
  });