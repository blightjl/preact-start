---
title: Chatroom + Packet Sniffer
date: '2023-12-25'
year: 2023
technologies:
  - Java
link: blightl
---
Part I:

As it was my first time socket programming, there was a lot of learning to do such as learning what IP addresses, ports, and how data were handled at each node. It was great to see real world application of programming concepts I had learned in class bring to life a chatroom, via a ‘server’ and ‘clients’. I used Java’s interfaces, abstractions, and enums. I was able to easily create an interface with modularity in mind for scalability and rigidity to handle different types of encryptions and their respective operations where appropriate. A flaw introduced in this project was the key that was used to encrypt and decrypt messages among the clients in the network. This meant that with a packet sniffer it would be easy to simply intercept the key and use it to gain unauthorized access to the messages between clients in the network. This is exactly what will be investigated in Part II.        

Part II:

An existing packet capture library called Jpcap was already available in Java. Therefore, I used this library in the chatroom I created in Part I by configuring it through a pom.xml file and Maven. I learned to look through the Jpcap documentation to find relevant functions to intercept messages sent through plain text in the network. After extending the program a bit more, the Initial Vector and Decryption Key could also be intercepted in the network as I knew the implementation of the chatroom system. Further filtering and conversions in the data stream had to be made to make the program run smoothly.
