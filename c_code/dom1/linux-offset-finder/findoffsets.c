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

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/sched.h>

#define MYMODNAME "FindOffsets "

static int my_init_module(
    void);
static void my_cleanup_module(
    void);

static int
my_init_module(
    void)
{
    struct task_struct *p = NULL;
    unsigned long commOffset;
    unsigned long tasksOffset;
    unsigned long mmOffset;
    unsigned long pidOffset;
    unsigned long pgdOffset;

    unsigned long start_codeOffset;
    unsigned long end_codeOffset;

    unsigned long start_dataOffset;
    unsigned long end_dataOffset;

    unsigned long start_brkOffset;
    unsigned long brkOffset;

    unsigned long start_stackOffset;
    
    unsigned long threadOffset;
    unsigned long userspOffset;
    
    printk(KERN_ALERT "Module %s loaded.\n\n", MYMODNAME);
    p = current;

    if (p != NULL) {
        commOffset = (unsigned long) (&(p->comm)) - (unsigned long) (p);
        tasksOffset =
            (unsigned long) (&(p->tasks)) - (unsigned long) (p);
        mmOffset = (unsigned long) (&(p->mm)) - (unsigned long) (p);
        pidOffset = (unsigned long) (&(p->pid)) - (unsigned long) (p);
        pgdOffset =
            (unsigned long) (&(p->mm->pgd)) - (unsigned long) (p->mm);
        start_codeOffset =
            (unsigned long) (&(p->mm->start_code)) -
            (unsigned long) (p->mm);
        end_codeOffset =
            (unsigned long) (&(p->mm->end_code)) -
            (unsigned long) (p->mm);

        start_dataOffset =
            (unsigned long) (&(p->mm->start_data)) -
            (unsigned long) (p->mm);
        end_dataOffset =
            (unsigned long) (&(p->mm->end_data)) -
            (unsigned long) (p->mm);

        start_brkOffset =
            (unsigned long) (&(p->mm->start_brk)) -
            (unsigned long) (p->mm);
        brkOffset =
            (unsigned long) (&(p->mm->brk)) -
            (unsigned long) (p->mm);

        start_stackOffset =
            (unsigned long) (&(p->mm->start_stack)) -
            (unsigned long) (p->mm);
        threadOffset =
            (unsigned long) (&(p->thread)) -
            (unsigned long) (p);
        userspOffset = 
            (unsigned long) (&(p->thread.sp)) -
            (unsigned long) (p->thread);

        printk(KERN_ALERT "[domain name] {\n");
        printk(KERN_ALERT "    ostype = \"Linux\";\n");
        printk(KERN_ALERT "    sysmap = \"[insert path here]\";\n");
        printk(KERN_ALERT "    linux_name = 0x%x;\n",
               (unsigned int) commOffset);
        printk(KERN_ALERT "    linux_tasks = 0x%x;\n",
               (unsigned int) tasksOffset);
        printk(KERN_ALERT "    linux_mm = 0x%x;\n",
               (unsigned int) mmOffset);
        printk(KERN_ALERT "    linux_pid = 0x%x;\n",
               (unsigned int) pidOffset);
        printk(KERN_ALERT "    linux_pgd = 0x%x;\n",
               (unsigned int) pgdOffset);
        printk(KERN_ALERT "}\nOffsets:\n");
        printk(KERN_ALERT "    start_code = 0x%x;\n",
               (unsigned int) start_codeOffset);
        printk(KERN_ALERT "    end_code = 0x%x;\n",
               (unsigned int) end_codeOffset);
        printk(KERN_ALERT "    start_data = 0x%x;\n",
               (unsigned int) start_dataOffset);
        printk(KERN_ALERT "    end_data = 0x%x;\n",
               (unsigned int) end_dataOffset);
        printk(KERN_ALERT "    start_brk = 0x%x;\n",
               (unsigned int) start_brkOffset);
        printk(KERN_ALERT "    brk = 0x%x;\n",
               (unsigned int) brkOffset);
        printk(KERN_ALERT "    start_stack = 0x%x;\n",
               (unsigned int) start_stackOffset);
        printk(KERN_ALERT "    thread = 0x%x;\n",
               (unsigned int) threadOffset);
        printk(KERN_ALERT "    usersp = 0x%x;\n",
               (unsigned int) userspOffset);   
    }
    else {
        printk(KERN_ALERT
               "%s: found no process to populate task_struct.\n",
               MYMODNAME);
    }

    return 0;
}

static void
my_cleanup_module(
    void)
{
    printk(KERN_ALERT "Module %s unloaded.\n", MYMODNAME);
}

module_init(my_init_module);
module_exit(my_cleanup_module);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Nilushan Silva");
MODULE_DESCRIPTION("task_struct offset Finder");
