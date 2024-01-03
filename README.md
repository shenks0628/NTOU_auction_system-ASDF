# 軟體工程專案 海大拍賣系統-ASDF

## 小組成員
* 組長：01057115 沈奎勳
* 組員：01057107 戴毓辰、01057108 李宇捷、01057116 李岳、01057153 廖永竣

## 小組大致分工
* 01057115 沈奎勳
    * 系統首頁頁面與功能（最新商品、推薦商品、曾經瀏覽的商品等）
    * 競標相關頁面與功能（競標運作流程、策略設定等）
    * 賣家相關頁面與功能（賣東西、商品管理等）
    * 系統後端實作與部署
* 01057107 戴毓辰
    * 商品頁面（顯示商品資訊、評價等）
    * 新增/編輯商品頁面（輸入限制、編輯條件等）
* 01057108 李宇捷
    * 網站Header（Google登入、搜尋用戶或關鍵字與搜尋紀錄、跳轉與分享連結、RWD顯示等）
    * 用戶資訊頁面（編輯個人資訊、顯示販賣商品等）
    * 商品頁面手機版（顯示商品資訊、下訂單功能等）
    * 搜尋頁面與功能（切換分類、排序、排列模式等）
    * 聊天頁面與功能（訂單確認與取消、上傳圖片等）
    * 寄信後端實作
* 01057116 李岳
    * 評論功能（新增評價、賣家評分數、更新賣家販賣紀錄）
    * 賣家財務報表（顯示商品交易量、商品獲利金額）
* 01057153 廖永竣
    * 購物車（修改商品數量、移除購物車、下訂單）
    * 購買紀錄頁面（顯示購買紀錄）

## 提升流程品質或系統品質的措施
1. Code review
    * 至少需要有一人 approve
    * 程式需要有可讀性
    * 變數命名需要有意義
    * 程式功能需符合預期
2. Merge 或遇到 Conflict 時
    * 需要舉行會議討論
    * 會議至少需要三人參與
3. 使用 JMeter 對部署在 Render 的網站做壓力測試

## 系統概述
現在科技日新月異，網路上有各式各樣的交易平台，如：瞎啤、批西home、濤堡...等。然而，在這些平台上不一定能保證每個賣家或買家都是好人，有機會就會遇到劣質賣家或買家，有些甚至還是詐騙的。考量到以上情況，我們決定要開發一個供海大師生使用的交易平台，【海大拍賣系統-ASDF】。
本系統名稱中的 ASDF 意義如下：
* AS - Auction System，即拍賣系統。
* D - Dependable，期許我們的平台能夠提供可靠的服務。
* F - Friendly，期許我們的平台能夠提供友善的服務。

本系統是以國立臺灣海洋大學師生為主要客群的線上拍賣系統，目的在提供海大師生一個安全且友善的交易平台，讓大家都能夠快快樂樂的上線買東西，同時也能促進海大經濟，讓海大發大財。
本系統的開發將主要以 HTML + CSS + JavaScript 作為前端、 Node.js 作為後端，資料庫則是使用 Google 的 Firestore Database。 

在這個平台上，使用者可以註冊及登入自己的帳號，一般使用者可能會是買家或賣家，也可能同時都是。
* 買家：可以搜尋商品、查看商品與賣家的資料、與賣家討論、競標商品、將商品加入購物車、確認與完成訂單、撰寫評價、查看購買記錄。
* 賣家：可以新增或刪除商品、查看買家的資料、確認接收與完成訂單、查看銷售紀錄。

## 相關網址與資訊
* 部署好的系統網址：https://ntou-asdf.onrender.com/header/
* GitHub repo: https://github.com/shenks0628/NTOU_auction_system-ASDF
* Trello: https://trello.com/w/user71211891
* 系統功能 demo 影片一（課程展示的版本）：https://www.youtube.com/watch?v=rZBzciBh-8M
* 系統功能 demo 影片二（最終完成的版本）：https://www.youtube.com/watch?v=WzEu5hzpDNg

## 使用須知與說明（強調事項）
* 因登入部分僅可使用 Google 第三方登入（點擊網頁左上角 Google 圖示），故沒有提供使用者帳號密碼。
* 登入後即可開始使用競標、購物車、下訂單、聊天室等等功能，個人頁面、聊天室、賣東西頁面、登出可從網頁左上角（原登入處）找到並使用。
* 競標運作方式如下：
    * 賣家設定競標商品的最晚結標時間（不得超過設定日起七日）。
    * 買家開始下注，下注時須設定自己的最高出價與自動加價的金額（一旦買家下注後，賣家從此刻開始永不得再編輯商品的價錢與最晚結標時間等重要資訊，但賣家仍可以刪除商品）。
    * 商品一旦開始有人開始下注，結標時間 = min(最新有效加注時間 + 八小時, 賣家設定的最晚節標時間)，故結標時間會依情況有所變動。
    * 商品競價的價錢 = min(次高出價者的喊價 + 最高出價者的自動加價金額, 最高出價者的喊價)。
        * 例一：次高出價者出 1500 元，最高出價者出 1750 元、自動加價 300 元 -> 商品競價：1750 元。
        * 例二：次高出價者出 1500 元，最高出價者出 2000 元、自動加價 300 元 -> 商品競價：1800 元。
    * 若結標時間到，沒有人下注該商品，該商品會被系統自動刪除、下架。反之，則會保留並加入最高出價者的購物車（購物車中的競標商品不可移除或修改數量）。
* 以下是老師與助教在測試時可能會發生的情況：
    * 因為此系統是部署在 Render 上，而 Render 對免費的服務有一個讓網站休息的機制（每當這個網頁太久沒有人使用時就會自動關掉系統），當有人嘗試連線的時候才會重啟系統。所以點擊網址進入網站時，有可能會需要花一點點時間等待系統重啟。
    * 因為此系統使用的資料庫是 Google 的 Firestore Database，免費的服務對於每天的用量有一定限制，如：讀取數一天（下午四點至隔天下午四點）至多五萬筆等限制，故可能會有當天用量超額導致系統服務暫停的情形。若是在測試時發生此情形，即需要等到下一個下午四點後才可以再進行操作。
    * 如果因此造成困擾還請見諒，謝謝老師和助教！