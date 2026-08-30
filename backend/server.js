require('dotenv').config();
const express =require('express');
const cors=require('cors');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const app=express();
const PORT=process.env.PORT || 3000;
const pool=require('./db');

app.use(cors());
app.use(express.json());


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access token missing or invalid" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next(); 
    });
};

app.post('/api/login',async(req,res)=>{
  try{  
    const{account_email,user_password}=req.body;
    if(!account_email||!user_password){
        return res.status(400).json({message:"email & password are required"});
    }
    
    const userQuery=await pool.query('select * from user_credentials where umail=$1',
        [account_email.toLowerCase().trim()]
    );
    
    if(userQuery.rows.length===0){
        return res.status(401).json({
            message:"invalid email or password"
        });
    }
    
    const user=userQuery.rows[0];

    const ismatch=await bcrypt.compare(user_password,user.upass);

    if(!ismatch){
        return res.status(401).json({
            message:"invalid email or password"
        });
    }

    const accountCheck=await pool.query('select id from accounts where uid=$1 and status=$2 limit 1',[user.uid,'active']);

    const hasAccount=accountCheck.rows.length>0;

    const token=jwt.sign(
        {userId:user.uid,email:user.umail,role:user.role},
        process.env.JWT_SECRET || 'fallback_secret_key',
        {expiresIn:'1h' }
    );

    return res.status(200).json({
        message:"login successfull",
        token:token,
        user:{
            id:user.uid,
            name:user.uname,
            email:user.umail,
            hasAcc:hasAccount,
            accountId:hasAccount?accountCheck.rows[0].id:null
        }
    });
   }catch(error){
    console.error("server error:",error );
    return res.status(500).json({
        message:"internal error please try again"
    });
   }
});

app.post('/api/register',async(req,res)=>{
    const{name,email,password}=req.body;
    if(!name || !email || !password)
        return res.status(400).json({message:"All fields are required"});
    try{
        const userCheck=await pool.query('select * from user_credentials where umail=$1',[email]);
        if(userCheck.rows.length>0)
            return res.status(400).json({errors:{email:"Email is already registered"}});
        const hashPassword=await bcrypt.hash(password,10);
        const newUser=await pool.query('insert into user_credentials (uname,umail,upass) values($1,$2,$3) returning uid,uname,umail',[name,email,hashPassword]); 
        const registeredUser=newUser.rows[0];

        const token=jwt.sign(
            {userId:registeredUser.uid,email:registeredUser.umail},
            process.env.JWT_SECRET || 'fallback_secret_key',
            {expiresIn:'1h'}  
        );
        res.status(201).json({
            message:"User registered successfully!",
            token,
            user:registeredUser
        });
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error, please try again"});
    }
});


app.post('/api/accounts',authenticateToken,async(req,res)=>{
    try{
        const uid=req.user.userId;
        const{acc_type}=req.body;
        if(!uid || !acc_type)
            return res.status(400).json({message:"user ID and Account type required"});
        const accountNumber=Math.floor(100000000000 +Math.random()*900000000000).toString();
        const newAccount=await pool.query(`insert  into accounts (uid,account_number,account_type,balance,status)
            values($1,$2,$3,0.00,'active') returning *;`,[uid,accountNumber,acc_type]);
        return res.status(201).json({
            message:"Account created successfully",
            account:newAccount.rows[0]
        });    
    }catch(err){
        console.error("Account creation error",err);
        return res.status(500).json({message:"internal error"});
    }
});

app.get('/api/transactions/:acc_id',authenticateToken,async (req,res)=>{
    try{
        const{acc_id}=req.params;
        const{limit}=req.query;
        const userId=req.user.userId;
        const accountQuery=await pool.query(
            'select id,account_number,account_type,balance,status from accounts where id=$1 and uid=$2',[acc_id,userId]
        );
        if(accountQuery.rows.length===0)
            return res.status(403).json({message:"unauthorized access"});

        let TransactionQuery=`select tid,transaction_type,amount,created_at from transactions where acc_id=$1 
            order by created_at desc`;
        if(limit !=='all')
            TransactionQuery+=' limit 3';
        
        const result=await pool.query(TransactionQuery,[acc_id]);

            return res.status(200).json({account:accountQuery.rows[0],
                transactions:result.rows});
    }catch(err){
        console.error("Fetch Error",err);
        return res.status(500).json({message:"internal server error"});
    }
});


app.post('/api/deposit',authenticateToken,async (req,res)=>{
    const {accountId,amount}=req.body;
    if(!amount || amount<=0)
        return res.status(400).json({message:"please enter valid amount"});
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        const balanceUpdate= await client.query(`update accounts
             set balance=balance + $1 where id=$2 and uid=$3
              returning id,balance,account_number;`,[amount,accountId,req.user.userId]);
        if(balanceUpdate.rows.length===0){
            await client.query('ROLLBACK');
            return res.status(404).json({message:"Account not found"});
        }   
        const updateAccount=balanceUpdate.rows[0];
        await client.query(`insert into transactions (acc_id,transaction_type,amount,description) 
            values($1,$2,$3,$4);`,[accountId,'deposit',amount,`deposited ${amount}`]); 
        await client.query('COMMIT');   
        return res.status(200).json({
            message: "Deposit successful",
            newBalance: updateAccount.balance } );  
    }catch(err){
        await client.query('ROLLBACK');
        console.error("Deposit error:", err);
        return res.status(500).json({ message: "Server error while processing deposit." });
    }finally{
        client.release();
    }
});

app.post('/api/withdraw',authenticateToken,async (req,res)=>{
    const {accountId,amount}=req.body;
    if(!amount || amount<=0)
        return res.status(400).json({message:"please enter valid amount"});
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        const balanceCheck= await client.query(`select balance from accounts where id=$1 and uid=$2`,[accountId,req.user.userId]);
        if(balanceCheck.rows.length===0){
            await client.query('ROLLBACK');
            return res.status(404).json({message:"Account not found"});
        }   
        const currentBalance=parseFloat(balanceCheck.rows[0].balance);
        if(currentBalance<parseFloat(amount)){
            await client.query('ROLLBACK');
            return res.status(400).json({message:"Insufficient balance"});
        }

        const balanceUpdate=await client.query(`update accounts set balance=balance-$1 where id=$2 returning id,balance,account_number`,[amount,accountId]);

        const updateAccount=balanceUpdate.rows[0];

        await client.query(`insert into transactions (acc_id,transaction_type,amount,description) 
            values($1,$2,$3,$4);`,[accountId,'withdraw',amount,`withdrew ${amount}`]); 
        await client.query('COMMIT');   
        return res.status(200).json({
            message: "Withdrawal successful",
            newBalance: updateAccount.balance } );  
    }catch(err){
        await client.query('ROLLBACK');
        console.error("Withdrawal error:", err);
        return res.status(500).json({ message: "Server error while processing deposit." });
    }finally{
        client.release();
    }
});

app.post('/api/transfer',authenticateToken, async(req,res)=>{
    const { senderAccountId, recipientAccountNumber, amount, description } = req.body;

    if (!recipientAccountNumber || !amount || amount <= 0) {
        return res.status(400).json({ message: "Please enter a valid amount and recipient account number" });
    }
    const client=await pool.connect();
    try{
        await client.query('BEGIN');
        const senderCheck=await client.query('select id,balance,account_number from accounts where id=$1 and uid=$2 for update',[senderAccountId,req.user.userId]);
        if(senderCheck.rows.length===0){
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Sender account not found" });
        }
        const sender=senderCheck.rows[0];
        if(parseFloat(sender.balance)<parseFloat(amount)){
            await client.query('ROLLBACK');
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const receiverCheck=await client.query('select id,balance,account_number from accounts where account_number=$1 for update',[recipientAccountNumber.trim()]);
        if(receiverCheck.rows.length===0){
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Recipient account does not exist" });
        }
        const receiver=receiverCheck.rows[0];
        if(sender.id===receiver.id){
            await client.query('ROLLBACK');
            return res.status(400).json({message:"Cannot transfer money to your own account"});
        }

        await client.query('update accounts set balance=balance-$1 where id=$2',[amount,sender.id]);

        await client.query('update accounts set balance=balance+$1 where id=$2',[amount,receiver.id]);

        const transDesc=description || "money transfer";

        await client.query('insert into transactions (acc_id,transaction_type,amount,description) values($1,$2,$3,$4)',[sender.id,'transfer',amount,`Transfered to ${receiver.account_number}:${transDesc}`]);

        await client.query('insert into transactions(acc_id,transaction_type,amount,description) values($1,$2,$3,$4)',[receiver.id,'receive',amount,`Received from ${sender.account_number}:${transDesc}`]);

        await client.query('COMMIT');
        return res.status(200).json({ message: "Transfer successful" });    
    }catch(err){
        await client.query('ROLLBACK');
        console.error("Transfer error:", err);
        return res.status(500).json({ message: "Server error while processing transfer." });
    }finally{ client.release();}
});

app.get('/api/credentials/:accountId',authenticateToken,async(req,res)=>{
    try{
        const{accountId}=req.params;
        const userId=req.user.userId;
        const accountQuery=await pool.query('select created_at from accounts where id=$1 and uid=$2',[accountId,userId]);
        if(accountQuery.rows.length===0)
            return res.status(404).json({message:"Account not found"});
        return res.status(200).json({
            created_at:accountQuery.rows[0].created_at
        });
    }catch(err){
        console.error("Fetch Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(PORT,()=>{
    console.log(`backend server running on http://localhost:${PORT}`);
});