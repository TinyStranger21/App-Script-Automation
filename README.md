# App-Script-Automation
Automation created using Appscript and cursor to log and email myself the soonest bus to take at the provided locations. This was then housed in an webpage made and connected with through cursor.
My bus usage is very random, but I just want to know what the soonest bus would be to get me from A to B, and be able to see that easily. 
I decided I would create an automation that would log the bus into google sheets and send me an email about the bus route.

Starting the appscript seemed to be very easy. Working with Gemini I was able to get my first baby steps into appscript and start the process of connecting to the RTD API.
This then became a lot more work. I had to go through the interline portal in order to get an API key that would allow me to access the RTD data and then keeping working with Gemini to get the key to actually work.
Eventually, I am pretty sure it decided we would go through another method that doesn't even go through the API and instead uses Google Maps Service built right into the code.
This meant I didn't need the API key and it wouldn't use any tokens. After some more debugging with Gemini, it started to work, sending me emails and adding information into the Google Sheets.
Once I had this, I thought it would be cool to try to make this into a website that would allow you to input the locations and then get the information within the page.
I wanted to create a layout but it was a lot of work to get the cursor webpage to connect with the Appscript. 
Once the appscript was deployed, I had to go throught he terminal and download homebrew, and work through the terminal in order to get things running on my computer.

Overall, I learned a lot from this. I think the biggest is what things can I do and how long does it take to do those things?
If I am working on a project that needs to be a quick prototype, maybe I can use other methods to display this without going through lots of different API's and debugging.
I think the challenging part for this was understading if there was anything you weren't providing that would allow the code to work. 
There were many moments where I thought that I was missing something on my end because the new code consistently gave me errors.
I feel like now that I know how appscript works, I feel motivated to make more automations, specifically something using google calenders.
