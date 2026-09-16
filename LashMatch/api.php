<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
ini_set('session.use_strict_mode','1');
session_set_cookie_params(['httponly'=>true,'secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off','samesite'=>'Lax','path'=>'/']);
session_start();
function respond(array $data,int $status=200): void {
 http_response_code($status);echo json_encode($data,JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);exit;
}
function database(): PDO {
 $c=require __DIR__.'/config.php';
 return new PDO("mysql:host={$c['host']};port={$c['port']};dbname={$c['database']};charset=utf8mb4",$c['username'],$c['password'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false]);
}
function field(array $data,string $key): string {return isset($data[$key]) && is_string($data[$key])?trim($data[$key]):'';}
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
$action=$_GET['action'] ?? '';
$method=$_SERVER['REQUEST_METHOD'];
try {
 if($action==='session' && $method==='GET')respond(['user'=>$_SESSION['user'] ?? null,'csrf'=>$_SESSION['csrf']]);
 if($action==='studios' && $method==='GET'){
 $rows=database()->query('SELECT id,name,city,address,description,specialties,is_demo FROM studios ORDER BY id')->fetchAll();
 foreach($rows as &$row)$row['specialties']=json_decode($row['specialties'],true,512,JSON_THROW_ON_ERROR);
 unset($row);respond(['studios'=>$rows]);
 }
 if(!in_array($action,['signup','login','logout','save_match'],true))respond(['error'=>'Endpoint not found.'],404);
 if($method!=='POST'){header('Allow: POST');respond(['error'=>'Use POST for this action.'],405);}
 if(!hash_equals($_SESSION['csrf'],$_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''))respond(['error'=>'Your session has expired. Refresh the page and try again.'],403);
 $raw=file_get_contents('php://input',false,null,0,8193);
 if(strlen($raw)>8192)respond(['error'=>'Request is too large.'],413);
 $data=json_decode($raw,true);
 if(!is_array($data))respond(['error'=>'Invalid request body.'],400);
 if($action==='logout'){$_SESSION=[];session_regenerate_id(true);respond(['success'=>true]);}
 if($action==='signup' || $action==='login'){
 $email=strtolower(field($data,'email'));
 $password=isset($data['password']) && is_string($data['password'])?$data['password']:'';
 if(!filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($email)>254 || strlen($password)<8 || strlen($password)>72)respond(['error'=>'Enter a valid email and a password of 8–72 bytes.'],422);
 $db=database();$ipHash=hash('sha256',$_SERVER['REMOTE_ADDR'] ?? 'unknown');
 $throttle=$db->prepare('SELECT COUNT(*) FROM auth_attempts WHERE ip_hash=? AND attempted_at>DATE_SUB(NOW(),INTERVAL 15 MINUTE)');$throttle->execute([$ipHash]);
 if((int)$throttle->fetchColumn()>=20)respond(['error'=>'Too many attempts. Please try again in 15 minutes.'],429);
 $db->prepare('INSERT INTO auth_attempts (ip_hash) VALUES (?)')->execute([$ipHash]);
 $db->exec('DELETE FROM auth_attempts WHERE attempted_at<DATE_SUB(NOW(),INTERVAL 1 DAY)');
 if($action==='signup'){
 $name=field($data,'name');if($name==='' || strlen($name)>100)respond(['error'=>'Enter a name of up to 100 bytes.'],422);
 try{$statement=$db->prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)');$statement->execute([$name,$email,password_hash($password,PASSWORD_DEFAULT)]);}
 catch(PDOException $e){if($e->getCode()==='23000')respond(['error'=>'Unable to create this account. Try logging in or use another email.'],409);throw $e;}
 $user=['id'=>(int)$db->lastInsertId(),'name'=>$name,'email'=>$email];
 }else{
 $statement=$db->prepare('SELECT id,name,email,password_hash FROM users WHERE email=?');$statement->execute([$email]);$record=$statement->fetch();
 $hash=$record?$record['password_hash']:'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
 if(!password_verify($password,$hash) || !$record)respond(['error'=>'Email or password is incorrect.'],401);
 $user=['id'=>(int)$record['id'],'name'=>$record['name'],'email'=>$record['email']];
 }
 session_regenerate_id(true);$_SESSION['user']=$user;$_SESSION['csrf']=bin2hex(random_bytes(32));
 respond(['user'=>$user,'csrf'=>$_SESSION['csrf']],$action==='signup'?201:200);
 }
 if($action==='save_match'){
 if(empty($_SESSION['user']))respond(['error'=>'Log in to save your match.'],401);
 $shape=field($data,'eye_shape');$finish=field($data,'finish');$occasion=field($data,'occasion');
 $matches=['natural'=>'Classic','balanced'=>'Hybrid','textured'=>'Wispy','dramatic'=>'Volume'];
 if(!in_array($shape,['almond','round','hooded','monolid','unsure'],true) || !isset($matches[$finish]) || !in_array($occasion,['everyday','event'],true))respond(['error'=>'Please select valid quiz answers.'],422);
 $db=database();$statement=$db->prepare('INSERT INTO lash_matches (user_id,lash_style_id,eye_shape,finish,occasion) SELECT ?,id,?,?,? FROM lash_styles WHERE name=?');
 $statement->execute([$_SESSION['user']['id'],$shape,$finish,$occasion,$matches[$finish]]);
 if($statement->rowCount()!==1)respond(['error'=>'Style data is missing. Import database.sql and retry.'],503);
 respond(['success'=>true,'style'=>$matches[$finish]],201);
 }
}catch(PDOException $e){error_log('LashMatch database error: '.$e->getMessage());respond(['error'=>'The database is unavailable. Start MySQL and complete SETUP.md.'],503);}
catch(Throwable $e){error_log('LashMatch error: '.$e->getMessage());respond(['error'=>'Something went wrong. Please try again.'],500);}
