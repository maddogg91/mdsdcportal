function postrequest(req, url){
  let options = {
      method: 'POST',
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(req)
  }
    const promise = fetch(url, options);
  promise.then(response => {
      if(!response.ok){
          console.error(response)
      } 
    if (response.redirected) {
        window.location.href = response.url;
    }
  }).then(result => {


  })

}