---
title: HedgeFollow Sweeper
date: '2023-08-01'
year: 2023
technologies:
  - Python
  - Cron
link: blightl
---
Developed a web scraper for hedgefollow.com using Python, leveraging BeautifulSoup, Selenium, requests, regular expressions, and CSS selectors. The scraper extracted data from the past 24 hours and stored it in JSON format for further analysis. This data was used to identify the greatest stock changes and percentage shifts among insiders. Using the Twitter API and cron jobs, I automated tweets to report the insiders with the largest portfolio movements in terms of magnitude and percentage when compared to all other insiders for the given time period. I also handled various edge cases as the project progressed, such as for instance, modifying the cron job to prevent it from running on weekends and ensuring smooth functionality throughout the project.
