const express = require("express");
const bcrypt  = require("bcrypt");
const Model = require('../models');
const User = Model.user;
const util = require('../utils/auth');

// login user and admin 
exports.login = async (req,res) =>{
    const {email,password} = req.body;
    const signinUser = await User.findOne({where:{email:email}});
    if(signinUser){
        if(bcrypt.compareSync(password,signinUser.password)){
            res.send({
                id:signinUser.id,
                name:signinUser.name,
                phone:signinUser.phone,
                username:signinUser.username,
                email:signinUser.email,
                isAdmin:signinUser.admin,
                picture:signinUser.picture,
                token:util.getToken(signinUser)
            })
        }else{
            return res.status(401).send({message:'Invalid Password'})
        }    
    }else{
        return res.status(401).send({message:'Invalid Username or Password'})
    }
}

// register new user
exports.register = async (req,res) =>{
    try{
        const {name,username,email,password,gender,phone,address} = req.body;
        const userData = {
            name:name,
            username:username,
            email:email,
            password:password,
            gender:gender,
            phone:phone,
            address:address,
            role:"User",
            admin:0,
            picture:'http://localhost:4000/profile/account.png'
        };
        const user = await User.findOne({
            where:{
                email:email
            }
        })
        if (!user){
            bcrypt.hash(req.body.password,10,async (err,hash) =>{
                userData.password = hash;
                const newUser = await User.create(userData);
                if(newUser){
                    res.send({
                        id:newUser.id,
                        name:newUser.name,
                        email:newUser.email,
                        isAdmin:newUser.admin,
                        token:util.getToken(newUser)
                    })
                }else{
                    return res.status(401).send({message:'invalid user data'})
                }
            })  
        }else{
            res.status(401).send({message:'user already axists'})
        }   
    }catch(err){
        res.send({message:`error ${err}`})
    }        
}

// create new admin as default
exports.createAdmin = async(req,res) =>{
    try{
    const admin = {
        name:"zurkerberg",
        username:"zurkerberg",
        email:"zurkerberg@gmail.com",
        password:"123",
        gender:"male",
        phone:"089533201888",
        address:"indonesia",
        role:"Admin",
        admin:1,
        picture:'http://localhost:4000/profile/account.png'
    };
    const newAdmin = await User.create(admin);
        res.send(newAdmin)
    }catch(error){
        res.send({message:error.message})
    }
}

// update user
exports.updateUser = async(req,res) =>{
    try{
        const {name,username,password,picture,email} = req.body;
        const {id} = req.params;
        const data = {
            name:name,
            username:username,
            password:password,
            email:email,
            picture:picture
        }
        const user = await User.update(data,{
            where:{id:id}
        })
        if(user){
            const getUser = await User.findOne({
                where:{id:id},
                attributes:['id','name','username','email','password','gender','phone','address','role','admin','picture']
            })
            res.status(200).json({data:getUser,message:'data has been updated'})
        }
    }catch(error){
            res.status(400).json({message:error.message})
        }
}