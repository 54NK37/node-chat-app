const users=[]

const addUser = ({id,username,room})=>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate
    if(!username || !room)
    {
        return {
            error : 'Username and room are required'
        }
    }

    //check for existing users
    const existingUser = users.find((user)=>{
        return user.username === username && user.room===room
    })

    //validate username
    if(existingUser)
    {
        return {
            error : 'Username inside room must be unique'
        } 
    }

    //store user 
    const user = {id,username,room}
    users.push(user)
    return {user}
}

const removeUser =(id)=>{
    const index =  users.findIndex(user=>user.id === id)

    if(index !== -1)
    {
        return users.splice(index,1)[0]
    }
}

const getUser = (id)=>{
    const user = users.find(user=>user.id===id)

    return user
}

const getUsersInRoom = (room)=>{
    const user = users.filter(user => user.room ==room.trim().toLowerCase())
    return user
}

module.exports={
    addUser,removeUser,getUser,getUsersInRoom
}