# put-LineBot-Project
อย่าลืมลง node.js ด้วย

npm install express @line/bot-sdk dotenv --save
npm install nodemon --save-dev

for ngrok
ngrok http --url=romantic-hideously-flamingo.ngrok-free.app 8080

# How to postman
**1. สร้าง Rich Menu ID  บน LINE Server ผ่าน Postman**
* ขั้นตอนที่ 1. กดปุ่ม New
![ขั้นตอนที่ 1](https://media.discordapp.net/attachments/1325059701062242304/1325060967746506822/image.png?ex=677a6ab1&is=67791931&hm=08fb7ceee293425af2bb4807866242b9da7b74ccd4ba960fd9aa09e10c2d78ff&=&format=webp&quality=lossless&width=1069&height=671)

* ขั้นตอนที่ 2. กดปุ่ม Http Request
![ขั้นตอนที่ 2](https://media.discordapp.net/attachments/1325059701062242304/1325061590491467889/image.png?ex=677a6b45&is=677919c5&hm=c3741d46e9eff6066b157ce60ccfb8f8b6ad1c29fcbb468b4455af5202b76ef8&=&format=webp&quality=lossless&width=1079&height=671)

* ขั้นตอนที่ 3. เปลี่ยน Request Method เป็น Post และ กำหนด URL เป็น https://api.line.me/v2/bot/richmenu
![ขั้นตอนที่ 3](https://media.discordapp.net/attachments/1325059701062242304/1325062607589081119/image.png?ex=677a6c38&is=67791ab8&hm=5d3aa380df6108cd8beac29bba598d6b6520192cf16852e481a52f4deb0ed8f3&=&format=webp&quality=lossless)

* ขั้นตอนที่ 4. ไปที่เมนู Headers แล้วสร้าง Key 2 ตัว 
1. Key : Authorization ในช่อง Value ให้ใส่ค่าว่า Bearer {Channel Access Token} 
2. Key : Content-Type ในช่อง Value ให้ใส่ค่าว่า application/json
![ขั้นตอนที่ 4](https://media.discordapp.net/attachments/1325059701062242304/1325063699764871250/image.png?ex=677a6d3c&is=67791bbc&hm=46040d8301d5e53d39adbcce99e98c88600ac094aa15c34166a048f0c512e7fe&=&format=webp&quality=lossless)

* ขั้นตอนที่ 5. ไปที่เมนู Body แล้วเลือก Type เป็น Raw  จากนั้นนำโค้ด LINE Rich Menu ที่ได้จาก LINE Bot Designer มาใส่ในช่อง Body แต่ในที่นี้เตรียมไว้ให้ใน "rich-menu/template/jason.txt"
![ขั้นตอนที่ 5](https://media.discordapp.net/attachments/1325059701062242304/1325064473454710845/image.png?ex=677a6df4&is=67791c74&hm=09661271eb04778518ff69e70428dea0651973cbc187c99d3a341240ba77b1e6&=&format=webp&quality=lossless)

* ขั้นตอนที่ 6. กดปุ่ม Send เพื่อเก็บ Rich Menu ID จาก Response
![ขั้นตอนที่ 6](https://media.discordapp.net/attachments/1325059701062242304/1325064899398864977/image.png?ex=677a6e5a&is=67791cda&hm=7f7e8030962e981ca557c65083b2d58c903d5b56304cc74f0ce7b3f17b08c682&=&format=webp&quality=lossless)

**2. ผูกรูปภาพ Rich Menu กับ Rich Menu ID  ผ่าน Postman**

* ขั้นตอนที่ 1. กดปุ่ม New
![ขั้นตอนที่ 1](https://media.discordapp.net/attachments/1325059701062242304/1325060967746506822/image.png?ex=677a6ab1&is=67791931&hm=08fb7ceee293425af2bb4807866242b9da7b74ccd4ba960fd9aa09e10c2d78ff&=&format=webp&quality=lossless&width=1069&height=671)

* ขั้นตอนที่ 2. กดปุ่ม Http Request
![ขั้นตอนที่ 2](https://media.discordapp.net/attachments/1325059701062242304/1325061590491467889/image.png?ex=677a6b45&is=677919c5&hm=c3741d46e9eff6066b157ce60ccfb8f8b6ad1c29fcbb468b4455af5202b76ef8&=&format=webp&quality=lossless&width=1079&height=671)

* ขั้นตอนที่ 3. เปลี่ยน Request Method เป็น Post และ กำหนด URL เป็น https://api-data.line.me/v2/bot/richmenu/{Richmenuid}/content 
![ขั้นตอนที่ 3](https://media.discordapp.net/attachments/1325059701062242304/1325065905704538173/image.png?ex=677a6f4a&is=67791dca&hm=a349872cedaf1ee81a44c9f8d049b3603f983c3c4c5a791aa90b31318e3e0dbc&=&format=webp&quality=lossless)

* ขั้นตอนที่ 4. ไปที่เมนู Headers แล้วสร้าง Key 1 ตัว
1. Key : Authorization ในช่อง Value ให้ใส่ค่าว่า Bearer {Channel Access Token}
![ขั้นตอนที่ 4](https://media.discordapp.net/attachments/1325059701062242304/1325066296093839421/image.png?ex=677a6fa7&is=67791e27&hm=da1e050bf79366a5d75c951625f2d866806b7aafdb582f245ed480df20eb5210&=&format=webp&quality=lossless)

* ขั้นตอนที่ 5. ไปที่เมนู Body > Type เป็น binary  > เลือกรูปภาพที่ต้องการ(ในที่นี้เตรียมไว้แล้วใน "rich-menu/linerichmenu.jpg" ) > กดปุ่ม Send
![ขั้นตอนที่ 5](https://media.discordapp.net/attachments/1325059701062242304/1325067237739991050/image.png?ex=677a7088&is=67791f08&hm=c6f96dee7c27b16272c88ea16e3f9868a07add288a38bcae96d7131341fdfe6b&=&format=webp&quality=lossless)

* ขั้นตอนที่ 6. ตรวจ Response เพื่อเช็คว่า Rich Menu ID ได้ถูกผูกกับ รูปภาพหรือยัง (จริงๆในกล่องสี่เหลืยม จะต้องส่ง {} กลับมาแค่นั้นแต่พอดีทำไปแล้วเลยได้แบบในรูป)
![ขั้นตอนที่ 6](https://media.discordapp.net/attachments/1325059701062242304/1325067993016959067/image.png?ex=677a713c&is=67791fbc&hm=bb2ede728f690bae40f92ff227b51987337ef03ad7b18c37d7345a44e6964c7a&=&format=webp&quality=lossless)

**3. ตั้งค่าเปลี่ยน LINE Rich Menu ให้กับ LINE Follower ทั้งหมด**

* ขั้นตอนที่ 1. กดปุ่ม New
![ขั้นตอนที่ 1](https://media.discordapp.net/attachments/1325059701062242304/1325060967746506822/image.png?ex=677a6ab1&is=67791931&hm=08fb7ceee293425af2bb4807866242b9da7b74ccd4ba960fd9aa09e10c2d78ff&=&format=webp&quality=lossless&width=1069&height=671)

* ขั้นตอนที่ 2. กดปุ่ม Http Request
![ขั้นตอนที่ 2](https://media.discordapp.net/attachments/1325059701062242304/1325061590491467889/image.png?ex=677a6b45&is=677919c5&hm=c3741d46e9eff6066b157ce60ccfb8f8b6ad1c29fcbb468b4455af5202b76ef8&=&format=webp&quality=lossless&width=1079&height=671)

* ขั้นตอนที่ 3. เปลี่ยน Request Method เป็น Post และ กำหนด URL ใหม่
1. โดยกำหนด URL เป็น https://api.line.me/v2/bot/user/all/richmenu/{richMenuId} 
![ขั้นตอนที่ 3](https://media.discordapp.net/attachments/1325059701062242304/1325069069669634159/image.png?ex=677a723c&is=677920bc&hm=31df44d2053c6a39c2ccb35ec64f0b3a66ffed2abc4778c7c6e9a16fa0f34302&=&format=webp&quality=lossless)

* ขั้นตอนที่ 4. ไปที่เมนู Headers แล้วสร้าง Key 1 ตัว  > กดปุ่ม Send > ตรวจ Response
1. Key : Authorization ในช่อง Value ให้ใส่ค่าว่า Bearer {Channel Access Token} 
2. โดยการกดปุ่ม Send ในครั้งนี้ ไม่ต้องใส่ Body เหมือนครั้งก่อน ๆ จากนั้นให้ตรวจสอบ Response เพื่อเช็คว่า Rich Menu ID ได้ถูกผูกกับ รูปภาพหรือยัง  โดยดูว่า Body ของ Response ตอบกลับมาว่า {} หรือไม่ 
![ขั้นตอนที่ 4](https://media.discordapp.net/attachments/1325059701062242304/1325070048712462346/image.png?ex=677a7326&is=677921a6&hm=99c9b4dfa2dfaa85fc345d358e67803284074491704724fe593267d34c99d1f5&=&format=webp&quality=lossless)