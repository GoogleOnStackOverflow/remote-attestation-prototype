//**************************************
// Name: Send a TCP packet to a server
// Description:/* The purpose of this article is to help out people who know the basics of C but want to start learning TCP controls in C. This program will connect to a server and send a TCP packet containing "La la la la". */
// By: Markus Delves (from psc cd)
//
//
// Inputs:usage: program_name <ip address> <port>
//
// Returns:The program will tell you if it was successful or not
//
//Assumes:None
//
//Side Effects:None known
//**************************************

/* The Includes For TCP Packet */
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <netdb.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/in_systm.h>
#include <netinet/ip.h>
#include <netinet/tcp.h>
#include <arpa/inet.h>

int sock;
int main(int argc, char *argv[]) {
	struct hostent *he; // Used for DNS lookup
	struct sockaddr_in blah; // inet addr stuff
	char packet[1024];
	char *address;
	int port;
	int i;

	if (argc != 3) {
        fprintf(stderr, "usage: %s <ip address> <port>\n",argv[0]);
        return(-1);
    }	
    
    address = argv[1];
    port = atoi(argv[2]);
    sock = socket (AF_INET, SOCK_STREAM, 0);
        		
    blah.sin_family = AF_INET;
    blah.sin_port = htons (port)
    he = gethostbyname (address);
    
    fprintf(stderr, "Attempting a connection with %s on port %d\n", address, port);
    	
	if (!he) {
		if ((blah.sin_addr.s_addr = inet.addr (address)) == ADDR_NONE)
            return(-1);
    } else {
        bcopy (he->h_addr, (struct in_addr *) &blah.sin_addr, he->h_length);
    }

	if (connect (sock, (struct sockaddr *) &blah, sizeof (blah)) < 0) {
		fprintf(stderr, "Connection refused by remote host.\n");
        return(-1);
	}
    
    sprintf(packet, "La la la la");
    write (sock, packet, strlen(packet));
    close (sock); // Close the connection
    fprintf(stderr, "Operation Completed. Exiting...");
 }

		