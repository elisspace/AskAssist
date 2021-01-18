// ALERT TIMER
// time between alerts is controlled by config.alert.frequency
let time=0;
let timer = setInterval(()=>{
    time++
},1000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    console.log(request);

    flag = request.message.flag;
    switch (flag) {
        case "alert":
            handleAlert(request);
            sendResponse("alerted")
        case "get":
            handleGet(request, sender, sendResponse);
    } 
    return true  
})

function handleAlert({message}){
    console.log('handling alert')
    alert = new Audio(chrome.runtime.getURL(`./assets/sounds/alert${message.option.sound}.mp3`));
    if(
        alert && 
        message.option.frequency > 0 && 
        time>message.option.frequency
    ){alert.play()}   
}

function handleGet(request, sender, sendResponse){
    let options = request.message.options
    let files = [];
    let components = [];
    // Convert Filenames to extension URLs
    options.forEach(function(u,i){
        options[i].path = chrome.runtime.getURL(options[i].path)
    })
    // Fetch files
    console.log('fetching files...')
    options.forEach(({path}, i) => {
        files.push(
            fetch(path).catch(console.log(path, 'notfound'))
        )
        console.log('Files:',files);
    });
    // When all files are fetched, convert them to text
    Promise.all(files).then(function(results){
        console.log('building components...')
        results.forEach(function(file, i){
            components[i]=file.text();
            console.log('Components:',components)    
        })
        Promise.all(components).then(function(results){
            console.log('response', results)
            sendResponse(results);
        })
    })
}