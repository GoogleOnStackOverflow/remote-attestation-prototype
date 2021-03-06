/* The LibVMI Library is an introspection library that simplifies access to 
 * memory in a target virtual machine or in a file containing a dump of 
 * a system's physical memory.  LibVMI is based on the XenAccess Library.
 *
 * Copyright 2011 Sandia Corporation. Under the terms of Contract
 * DE-AC04-94AL85000 with Sandia Corporation, the U.S. Government
 * retains certain rights in this software.
 *
 * Author: Bryan D. Payne (bdpayne@acm.org)
 *
 * This file is part of LibVMI.
 *
 * LibVMI is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * LibVMI is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public
 * License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with LibVMI.  If not, see <http://www.gnu.org/licenses/>.
 */

#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <sys/mman.h>
#include <stdio.h>
#include <inttypes.h>

#include <libvmi/libvmi.h>
#include <unistd.h>

void print_hex_string(void* buf, unsigned long size){
    unsigned long i = 0;
    for(i = 0; i<size; i++){
        printf("%02X", ((char*)buf)[i]);
    }
}

int main (int argc, char **argv)
{
    int PAGE_SIZE = getpagesize();
    int status_code = 404;
    char* err_result = NULL;
    // Fill this by insert findoffsets module on Dom1
    unsigned long start_code_offset = 0xe8;
    unsigned long end_code_offset = 0xf0;
    unsigned long start_data_offset = 0xf8;
    unsigned long end_data_offset = 0x100;
    unsigned long start_brk_offset = 0x108;
    unsigned long brk_offset = 0x110;
    unsigned long start_stack_offset = 0x118;
    unsigned long stack_vm_offset = 0xd8;

    vmi_instance_t vmi;
    addr_t list_head = 0, next_list_entry = 0;
    addr_t current_process = 0;
    char *procname = NULL;
    vmi_pid_t pid = 0;
    unsigned long tasks_offset = 0, pid_offset = 0, name_offset = 0;
    unsigned long mm_offset = 0, mm_addr = 0;
    unsigned long start_stack = 0, stack_pointer = 0, start_brk = 0, brk = 0;
    unsigned long start_code = 0, end_code = 0, start_data = 0, end_data = 0;
    status_t status;

    /* this is the VM or file that we are looking at */
    if (argc != 4) {
        status_code = 403;
        err_result = "Wrong arguments. Usage: get_data <vmname> <process name> <request type>";
        printf("{\"status_code\":%d, \"result\":\"%s\"}\n", status_code, err_result);
        return 1;
    }

    char *name = argv[1];
    char *target_process = argv[2];
    char *target_data = argv[3];

    /* initialize the libvmi library */
    if (vmi_init(&vmi, VMI_AUTO | VMI_INIT_COMPLETE, name) == VMI_FAILURE) {
        status_code = 500;
        err_result = "Failed to init LibVMI library.";
        printf("{\"status_code\":%d, \"result\":\"%s\"}\n", status_code, err_result);
        return 1;
    }

    /* init the offset values */
    // Get these data from the config file of the VM (/etc/libvmi.conf)
    // See: https://libvmi.wordpress.com/2015/01/23/libvmi-xen-setup/
    // Fill the config file with the output of the findoffset module
    if (VMI_OS_LINUX == vmi_get_ostype(vmi)) {
        tasks_offset = vmi_get_offset(vmi, "linux_tasks");
        name_offset = vmi_get_offset(vmi, "linux_name");
        pid_offset = vmi_get_offset(vmi, "linux_pid");
        mm_offset = vmi_get_offset(vmi, "linux_mm");
    }

    else if (VMI_OS_WINDOWS == vmi_get_ostype(vmi)) {
        status_code = 403;
        err_result = "Not supporting Windows";
        goto error_exit;
    }

    if (0 == tasks_offset || 0 == name_offset || 0 == pid_offset || 0 == mm_offset) {
        status_code = 500;
        err_result = "Failed to find offsets";
        goto error_exit;
    }

    /* pause the vm for consistent memory access */
    if (vmi_pause_vm(vmi) != VMI_SUCCESS) {
        status_code = 500;
        err_result = "Failed to pause VM";
        goto error_exit;
    }

    /* demonstrate name and id accessors */
    if (VMI_FILE == vmi_get_access_mode(vmi)) {
        status_code = 500;
        err_result = "Not supporting file mode";
        goto error_exit;
    }

    /* get the head of the list */
    list_head = vmi_translate_ksym2v(vmi, "init_task") + tasks_offset;
    next_list_entry = list_head;

    /* walk the task list */
    do {
        current_process = next_list_entry - tasks_offset;

        procname = vmi_read_str_va(vmi, current_process + name_offset, 0);

        if (!procname) {
            printf("Failed to find procname\n");
            goto error_exit;
        }else if (0 == strcmp(procname,target_process)){
            status_code = 200;
            /* Note: the task_struct that we are looking at has a lot of
             * information.  However, the process name and id are burried
             * nice and deep.  Instead of doing something sane like mapping
             * this data to a task_struct, I'm just jumping to the location
             * with the info that I want.  This helps to make the example
             * code cleaner, if not more fragile.  In a real app, you'd
             * want to do this a little more robust :-)  See
             * include/linux/sched.h for mode details */

            /* NOTE: _EPROCESS.UniqueProcessId is a really VOID*, but is never > 32 bits,
             * so this is safe enough for x64 Windows for example purposes */
            vmi_read_32_va(vmi, current_process + pid_offset, 0, (uint32_t*)&pid);

            // Get mm struct addr
            vmi_read_addr_va(vmi, current_process + mm_offset, 0, &mm_addr);

            // Get addrs of the segments
            vmi_read_addr_va(vmi, mm_addr + start_code_offset, 0, &start_code);
            vmi_read_addr_va(vmi, mm_addr + end_code_offset, 0, &end_code);
            
            vmi_read_addr_va(vmi, mm_addr + start_data_offset, 0, &start_data);
            vmi_read_addr_va(vmi, mm_addr + end_data_offset, 0, &end_data);

            vmi_read_addr_va(vmi, mm_addr + start_brk_offset, 0, &start_brk);
            vmi_read_addr_va(vmi, mm_addr + brk_offset, 0, &brk);

            vmi_read_addr_va(vmi, mm_addr + start_stack_offset, 0, &start_stack);
            vmi_read_addr_va(vmi, mm_addr + stack_vm_offset, 0, &stack_pointer);
            
            char* code_buffer[end_code-start_code];
            char* data_buffer[end_data-start_data];
            char* brk_buffer[brk-start_brk];
            char* stack_buffer[PAGE_SIZE];

            printf("{\"status_code\":%d,\"start_stack\":\"%p\",\"result\":{\"name\":\"%s\",\"pid\":%d",status_code,start_stack,procname,pid);
            printf(",\"data\":\"");
            if(0 == strcmp("code", target_data))
                print_hex_string(code_buffer,vmi_read_va(vmi, start_code, pid, code_buffer, end_code - start_code));
            else if(0 == strcmp("data", target_data))
                print_hex_string(data_buffer,vmi_read_va(vmi, start_data, pid, data_buffer, end_data - start_data));
            else if(0 == strcmp("heap", target_data))
                print_hex_string(brk_buffer,vmi_read_va(vmi, start_brk, pid, brk_buffer, brk - start_brk));
            else if(0 == strcmp("stack", target_data))
                print_hex_string(stack_buffer,vmi_read_va(vmi, start_stack-PAGE_SIZE, pid, stack_buffer, PAGE_SIZE));
            printf("\"}}\n");
        }

        /* follow the next pointer */
        free(procname);
        procname = NULL;

        status = vmi_read_addr_va(vmi, next_list_entry, 0, &next_list_entry);
        if (status == VMI_FAILURE) {
            printf("Failed to read next pointer in loop at %"PRIx64"\n", next_list_entry);
            goto error_exit;
        }
    } while(next_list_entry != list_head);

    if(status_code == 404)
        err_result = "Process not found";

error_exit:
    if(status_code != 200){
        printf("{\"status_code\":%d, \"result\":\"%s\"}\n", status_code, err_result);
    }
    /* resume the vm */
    vmi_resume_vm(vmi);

    /* cleanup any memory associated with the LibVMI instance */
    vmi_destroy(vmi);

    return 0;
}