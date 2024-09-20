export class ConsoleUtility {
    private static instance: ConsoleUtility;
    private dataMap: Map<string, any> = new Map();

    private constructor() {}

    // singleton pattern
    public static getInstance(): ConsoleUtility {
        if (!ConsoleUtility.instance) {
            ConsoleUtility.instance = new ConsoleUtility();
        }
        return ConsoleUtility.instance;
    }

    public trackData(varName: string, data: any): void {
        this.dataMap.set(varName, data);
    }

    public untrackData(varName: string): void {
        this.dataMap.delete(varName);
    }

    public printData(): void {
        this.dataMap.forEach((value, key) => {
            console.log(`${key}`);

            if (typeof value === 'string') {
                console.log(value);
            } else if (Array.isArray(value)) {
                this.toTable(value);
            } else if (typeof value === 'object') {
                this.toTable(value);
            } else {
                console.log(value);
            }

            console.log('--------------------------');
        });
    }

    public toTable(data: any): void {
        if (Array.isArray(data)) {
            if (data.length === 0) {
                console.log("Empty array.");
                return;
            }

            const firstElement = data[0];
            if (typeof firstElement === "object") {
                const headers = Object.keys(firstElement);
                const rows = data.map(item => headers.map(header => item[header]));
                this.printTable(headers, rows);
            } else {
                data.forEach((item, index) => {
                    console.log(`${index} | ${item}`);
                });
            }
        } else if (typeof data === "object") {
            const keys = Object.keys(data);
            if (keys.length === 0) {
                console.log("Empty object.");
                return;
            }

            const rows = keys.map(key => [key, data[key]]);
            this.printTable(['Key', 'Value'], rows);
        } else {
            console.log(data);
        }
    }

    private printTable(headers: string[], rows: any[][]): void {
        const colWidths = this.calculateColumnWidths(headers, rows);

        // Print headers
        const headerRow = headers.map((header, index) => header.padEnd(colWidths[index])).join(' | ');
        console.log(headerRow);
        console.log('-'.repeat(headerRow.length));

        // Print rows
        rows.forEach(row => {
            const paddedRow = row.map((col, index) => String(col).padEnd(colWidths[index]));
            console.log(paddedRow.join(' | '));
        });
    }

    private calculateColumnWidths(headers: string[], rows: any[][]): number[] {
        const colWidths = headers.map(header => header.length); // Initialize with header lengths

        // Find the maximum width for each column
        rows.forEach(row => {
            row.forEach((col, index) => {
                colWidths[index] = Math.max(colWidths[index], String(col).length);
            });
        });

        return colWidths;
    }
}

export const consUtil = ConsoleUtility.getInstance();
