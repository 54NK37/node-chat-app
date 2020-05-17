//elements
const $messageForm=document.querySelector('#message-form')
const  $messageFormInput =$messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//options
 const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix : true})

 const autoScroll =()=>{
//new message elemnt
const $newMsg = $messages.lastElementChild

//new msg height 
const newMsgStyle = getComputedStyle($newMsg)
const newMsgMargin = parseInt(newMsgStyle.marginBottom)
const newMsgHeigth = $newMsg.offsetHeight + newMsgMargin

//visible height 
const visibleHeight = $messages.offsetHeight

//height of container
const containerHeight = $messages.scrollHeight

//how far have I scrolled?
const scrollOffset = $messages.scrollTop + visibleHeight

//to check if we are at bottom before last msg was added 
//ie not to scroll if we  are checking past msgs
if(containerHeight - newMsgHeigth <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
}

 }
//client connect to server websocket
const socket = io()

// //catch emitted event
//client acknowledgement
socket.on('clientMsg', (msg,user) => {
    console.log(msg)
    //to render html template 
    const html = Mustache.render(messageTemplate,{
        msg:msg.text,
        username : user.username,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('clientUrl',(msg,user)=>{
    const html = Mustache.render(locationTemplate,{
        msg:msg.url,
        username : user.username,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()

})

socket.on('roomData',({room,users})=>{
const html = Mustache.render(sidebarTemplate,{
    room,
    users
})
document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit', (e) => {
    //so that page doest reload after event
    e.preventDefault()
    const msg = e.target.elements.message.value

    $messageFormButton.setAttribute('disabled','disabled')  
    
    socket.emit('sendAll', msg,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()

        if(error)
        {
            return console.log(error)
        }
        console.log("The msg was delivered")
    })
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Your browser doesnt support geolocation feature')
    }


    //client ack from server using callback
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation',
            {
                Latitude: position.coords.latitude,
                Longitude: position.coords.longitude
            },
            (url)=>{
                console.log(url)
                $locationButton.removeAttribute('disabled')
            }
        )
        $locationButton.setAttribute('disabled','disabled')
    })
})

socket.emit('join',{username,room},(error)=>{

    if(error)
    {
        alert(error)
        location.href='/'
    }
})
