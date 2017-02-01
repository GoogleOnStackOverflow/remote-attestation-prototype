#include <stdlib.h>
#include <stdio.h>

static int a = 1;

int foo1(){
	return 2;
}

int foo2(){
	return 2;
}

int foo3(){
	return foo2() + 1;
}

int main(){
        int* b  = malloc(sizeof(int));
        *b = 2;
        int c = 3;

        a = foo1();
        c = foo3();

        while(1);
};