export interface User {

	key?: string;
	email: string;
	password: string;
	nama: string;
	joinDate: string;
	jenisKelamin: string;
	alamat: string;
	kabupaten: string;
	kecamatan: string;
	ciamis: string;
	banjar: string;
	pangandaran: string;
	kotatasikmalaya: string;
	kabtasikmalaya: string;
	garut: string;
	sumedang: string;
	hariBuka: string;
	jamBuka: Date;
	jamTutup: Date;
	hp: string;
	deskripsi: string;
	foto: any;
	cover: any;
	ongkir:Array<any>;
	lat:any;
	long:any;
}