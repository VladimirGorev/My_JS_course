`use strict`;
import { v4 as uuidv4 } from 'uuid';
import * as crypto from "crypto";
import {generateHash} from "./helpers.js"
import Joi from "@hapi/joi";
import Boom from "@hapi/boom";
const users=[];
export default [
    {
        method: 'GET',
        path: '/hello',
        handler: (request, h) => {
            try {
                const userName = request.query.name || 'Гость';

                return `Hello, ${userName}, I am a server. How are you?`;
            } catch (e) {
                console.log(e);
                return Boom.badImplementation(`Sorry.An error occurred on the server`);
            }
        }
    },
    {
        method: 'POST',
        path: '/register',
        handler: ((request, h) => {
            try{
                const {name,surname,email,password,BirthDate} = request.payload;

                const arrDateBirthday=BirthDate.split(`.`);
                const registeredUserBirthday=new Date(arrDateBirthday[2],arrDateBirthday[1]-1,arrDateBirthday[0]);//User's date of birth
                const alreadyRegistered=users.find(user=>user.email===email);
                if(alreadyRegistered){
                    return Boom.badRequest(`This email is busy,try another `);
                }

                const passwordHash=generateHash(password)

                users.push({
                    name,
                    surname,
                    email,
                    password:passwordHash,
                    BirthDate,
                    userId:uuidv4(),
                    token:uuidv4(),
                    registerDate:new Date(),
                });
                console.log(users);
                return `user registered`;
            }catch (e) {
                console.log(e);
                return Boom.badImplementation(`Sorry.An error occurred on the server`);
            }
        }),
        options: {
            validate:{
                payload:Joi.object({
                    email:Joi.string().email().required(),
                    name:Joi.string().required(),
                    surname:Joi.string().required(),
                    BirthDate:Joi.string().required(),
                    password:Joi.string().required().min(6)
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/login',
        handler: ((request, h) => {
            try {
                const {name,surname,email,password,BirthDate} = request.payload;
                const goodLog = users.find(user => user.email === email);//verify email
                const goodPass = users.find(user => user.password ===generateHash(password) );//verify password
                if (goodLog&&goodPass) {
                    const usersToken=goodLog.token;
                    return h.response(`Good. Your token is  ${usersToken}`)//if the email and password match, we return our unique token
                }else{
                    return Boom.unauthorized(`Invalid log or password.Also perhaps you have not registered.`);
                }
            }catch (e) {
                console.log(e);
                return Boom.badImplementation(`Sorry.An error occurred on the server`);
            }
        }),
        options: {
            validate:{
                payload:Joi.object({
                    email:Joi.string().required().email() ,
                    password:Joi.string().required().min(6)
                })
            }
        }
    },
    {
        method: 'GET',
        path: '/info',
        handler: (request, h) => {
            try {
                return users;
            } catch (e) {
                console.log(e);
                return h.response(`Sorry.An error occurred on the server`).code(500);
            }
        },
        options:{
            auth:{
                strategy:`admin`
            }
        }
    },
    {
        method: 'GET',
        path: '/user/info',
        handler: (request, h) => {
            try {
                const usersId = request.query.userId;//extract from user request userId
                if(!usersId){
                    return Boom.badRequest(`Incorrectly entered userId`);
                }
                const searchUserInfo = users.find(user => user.userId === usersId);//
                if(!searchUserInfo){
                    return  Boom.badRequest(`Incorrectly entered userId`);
                }
                if (usersId === searchUserInfo.userId) {
                    return searchUserInfo
                };

            }catch (e) {
                console.log(e);
                return Boom.badImplementation(`Sorry.An error occurred on the server`);
            }
        },
        options: {
            validate:{
                query:Joi.object({
                    userId:Joi.string().required() ,
                })
            }
        }

    },
    {
        method: 'PUT',
        path: '/user/info',
        handler: (request, h) => {
            try {
                const {name,surname,email,password,BirthDate,userId} = request.payload;
                const searchUserIn3fo = users.find(user => user.userId === userId);//
                if(!searchUserIn3fo){
                    return Boom.badRequest(`Invalid UserId`);
                }
                if(userId===searchUserIn3fo.userId){
                    searchUserIn3fo.name=name||searchUserIn3fo.name;
                    searchUserIn3fo.surname=surname||searchUserIn3fo.surname;
                    searchUserIn3fo.email=email||searchUserIn3fo.email;
                    searchUserIn3fo.password=password||searchUserIn3fo.password;
                    searchUserIn3fo.BirthDate=BirthDate||searchUserIn3fo.BirthDate;
                    searchUserIn3fo.token.writable;
                    searchUserIn3fo.userId.writable;
                    searchUserIn3fo.registerDate.writable;
                    return searchUserIn3fo

                };
            }catch (e) {
                console.log(e);
                return Boom.badImplementation(`Sorry.An error occurred on the server`);
            }
        }
    },
]