export interface Contact {
    id: number;
    userId: number;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
}

export interface MessageModel
{
  id: number,
  type: string,
  body: string,
  contactName: string,
  status: string,
  createdAt: Date,
  updatedAt: Date
}
