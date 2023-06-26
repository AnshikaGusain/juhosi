Project Documentation

This document provides instructions on how to set up and use the project. It includes the necessary steps to install dependencies, configure the application, and interact with the provided features.

Table of Contents

1. Introduction 
2. Prerequisites
3. Installation
4. Configuration
5. Usage

Introduction

This project is a web application that includes a login system, order submission form, and administrative features. It allows users to log in as customers or administrators, submit orders, and view order data.

Prerequisites

Before proceeding with the installation, ensure that you have the following prerequisites installed on your system:

- Node.js 
- MySQL (Latest)


Installation

To install and set up the project, follow these steps:
1. Unzip the provided project zip folder to a desired location on your computer.
2. Open a terminal or command prompt and navigate to the project directory using following command:
cd project-directory

3. Install the project dependencies using the package manager (npm or yarn).
npm install
or
yarn install

Configuration

Before running the project, you need to configure the database connection. 

Follow these steps:

1.	Create a database having two tables – auth, and customer

For creating auth table use the following command:
Create table auth (
	id varchar(20) primary key,
	password varchar(20) not null
);


For creating customer table use the following command:

CREATE TABLE customer (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customerId VARCHAR(20) NOT NULL,
      orderDate DATE NOT NULL,
      company VARCHAR(50) NOT NULL,
      owner VARCHAR(50) NOT NULL,
      item VARCHAR(100) NOT NULL,
      quantity INT NOT NULL,
      weight FLOAT NOT NULL,
      shipmentRequest VARCHAR(100) NOT NULL,
      trackingId VARCHAR(50) NOT NULL,
      shipmentSize VARCHAR(20) NOT NULL,
      boxCount INT NOT NULL,
      specification VARCHAR(100) NOT NULL,
      checklistQuantity VARCHAR(50) NOT NULL
    );

2.	Insert dummy values in auth table by using following command:

insert into auth
values(“customer1”, “customer1”),(“customer2”, “customer2”),(“admin”, “admin”);

3.	Open the `server.js` file located in the project's root directory.

4.	 Replace the placeholder values for the database host, username, password, and database name with your MySQL database credentials.

const connection = mysql.createConnection({
  host: 'your_database_host',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database_name'
});
5.	Save the changes.

Usage
To use the project, follow these steps:

1.	 Start the application by running the following command in your terminal or command prompt:
nodemon server.js

2.	Open a web browser and navigate to `http://localhost:3000` to access the application.

3.	The login page will be displayed. Enter your username and password:

- For customer access, use `customer1` or `customer2` as the username.
- For administrator access, use `admin` as the username.

4.	After successful login, you will be redirected to the respective customer or administrator dashboard.

- Customers can submit orders using the provided form.
- Administrators can view order data in a table format.


