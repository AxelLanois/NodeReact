import React from "react";
import io from "socket.io-client";

class Chat extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            username: '',
            messagePublic: '',
            messagePrivate: '',
            messagesPrivate: [],
            messagesPublic: [],
            rooms: [],
            roomCurrent: ''
        };

        var statut = this;

        this.socket = io('localhost:5000');
        
        this.state.username = prompt("pseudo ?");
        this.state.roomCurrent = this.state.username;

        this.socket.emit("nouveau-client", this.state.username);
        
        this.socket.on("room_remove", function(pseudo){
            var listRoom = statut.state.rooms;
            var index = listRoom.indexOf(pseudo);
            if(index > -1){
                listRoom.splice(index, 1);
            }
            statut.setState({rooms: listRoom});
        });

        //récupère tous les salons existant pour les afficher dans la liste
        this.socket.on("list_rooms", function(listrooms){
            for(var i in listrooms){
                statut.setState({
                    rooms: [...statut.state.rooms, listrooms[i]]
                });
            }           
        });

        //lors de l'arrivé d'un nouveau client
        this.socket.on("nouveau-clients", function(pseudo){
            var informationMessage = {
                author: "serveur",
                message: pseudo + " a rejoint le réseau."
            };
            statut.setState({
                messagesPublic: [...statut.state.messagesPublic, informationMessage]
            });

            statut.setState({
                rooms: [...statut.state.rooms, pseudo]
            });
        });

        this.socket.on('send_message_private', function(data){
            statut.setState({
                messagesPrivate: [...statut.state.messagesPrivate, data]
            });
        });

        this.socket.on('send_message_public', function(data){
            statut.setState({
                messagesPublic: [...statut.state.messagesPublic, data]
            });
        });

        this.socket.on("deconnexion", function(){
            var informationMessage = {
                author: "serveur",
                message: "un utilisateur est parti du réseau."
            };
            statut.setState({
                messagesPublic: [...statut.state.messagesPublic, informationMessage]
            });
        });

        this.sendMessagePrivate = ev => {
            ev.preventDefault();
            
            this.socket.emit('message_private', {
                author: this.state.username,
                message: this.state.messagePrivate
            }, this.state.roomCurrent)
            this.setState({
                messagePrivate: ''
            });
        }

        this.sendMessagePublic = ev => {
            ev.preventDefault();
            this.socket.emit('message_public', {
                author: this.state.username,
                message: this.state.messagePublic
            })
            this.setState({
                messagePublic: ''
            });
        }       
    }
    changeRoom(e){
        this.socket.emit('join', e.currentTarget.dataset.id, this.state.username,this.state.roomCurrent)
        this.setState({
            roomCurrent: e.currentTarget.dataset.id,
            messagesPrivate: []
        });
    }
    render(){
        return (
            <div>
                <h1 id="welcome">Bienvenu {this.state.username}</h1>         
                <section className="container">
                    <div className="section-user">
                        <div className="user-title">
                            <h3>Salons</h3>
                        </div>
                        <ul className="user-list">
                            {this.state.rooms.map(room => {
                                return (
                                    <li className="user-item" onClick={this.changeRoom.bind(this)} data-id={room}>{room}</li>
                                )        
                            })}
                        </ul>
                    </div>

                    <div className="section-public">
                        <h3 className="title">Chat général</h3>
                        <div className="section-chat-public">
                            {this.state.messagesPublic.map(message => {
                                if(message.author === "serveur"){
                                    return (
                                        <p className="message message-center alert">{message.message}</p>
                                    )
                                }
                                else{
                                    if(message.author === this.state.username){
                                        return (
                                                <p className="message message-left">{message.author}: {message.message}</p>
                                            )
                                    }
                                    else{
                                        return (
                                            <p className="message message-right">{message.author}: {message.message}</p>
                                        )
                                    }
                                }                   
                            })}
                        </div>
                        <div className="form-chat">
                            <input type="text" value={this.state.messagePublic} onChange={ev => this.setState({messagePublic: ev.target.value})} className="input-message"/>
                            <button onClick={this.sendMessagePublic} className="input-button">Envoyer</button>
                        </div>
                    </div>


                    <div className="section-prive">
                        <h3 id="salons-titre" className="title">Salons de {this.state.roomCurrent}</h3>
                        <div className="section-chat-prive">
                            {this.state.messagesPrivate.map(message => {
                                if(message.author === "serveur"){
                                    return (
                                        <p className="message message-center alert">{message.message}</p>
                                    )
                                }
                                else{
                                    if(message.author === this.state.username){
                                        return (
                                                <p className="message message-left">{message.author}: {message.message}</p>
                                            )
                                    }
                                    else{
                                        return (
                                            <p className="message message-right">{message.author}: {message.message}</p>
                                        )
                                    }
                                }      
                                
                            })}
                        </div>
                        <div className="form-chat">
                            <input type="text" value={this.state.messagePrivate} onChange={ev => this.setState({messagePrivate: ev.target.value})} className="input-message"/>
                            <button onClick={this.sendMessagePrivate} className="input-button">Envoyer</button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default Chat;