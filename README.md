# SocialHelp-be
## **Requirements:**
* *Docker* : https://www.docker.com/products/docker-desktop/
* *SocialHelp*: clone the SocialHelp project if you haven't already done -> https://github.com/ciroraggio/SocialHelp

## **Instructions**

1. From the command line, navigate to the project folder and build the server's docker container (it might take a while):

    Only if you are not yet in the SocialHelp-be folder:

    ``` 
    cd SocialHelp-be
    ```
    Build the container keeping the social-help-be name:
    ``` 
    docker build -t social-help-be . 
    ```

1. **If you have already built the SocialHelp container following the instructions from the SocialHelp repository**, compose the application by running the command (remember, you must be in the SocialHelp-be project folder):

    ```
    docker compose -p socialhelp up
    ```

2. Navigate to `localhost:3000` and start using SocialHelp, remember that initially the database will be empty, you will have to create users that will remain in the MongoDB volume until you delete the container.

Enjoy! 😉👌 
