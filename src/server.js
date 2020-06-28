'use strict';

import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import * as path from "path";
import AuthBearer from "hapi-auth-bearer-token";
dotenv.config({
    path:path.join(path.resolve(),"./.env")
})
import routesArr from "./routes.js";

const init = async () => {

    const server = Hapi.server({
        port:parseInt(process.env.PORT||"3000",10),
        host:process.env.HOST||`localhost`,
        routes:{
            validate:{
                failAction:(req,h,err)=>{
                    throw err
                }
            }
        }
    });

    await server.register([
        AuthBearer
    ]);


    server.auth.strategy(`admin`,`bearer-access-token`,{
        validate:(req,token,h)=>{
            console.log(`in validate`,token);
            const isValid=process.env.ADMIN_TOKEN===token
            return{
                isValid,
                credentials:{},
                artifacts:{},
            }
        }
    })

    server.route(routesArr);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();

