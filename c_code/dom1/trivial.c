#include <stdlib.h>
#include <stdio.h>
static int a = 0;

int main(){
        int* b  = malloc(sizeof(int));
        *b = 2;
        int c = 3;

        printf("STATIC: %p\n",&a);
        printf("MALLOC: %p\n",b);
        printf("SIGN: %p\n",&c);
        while(1);
};